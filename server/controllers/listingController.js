const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const db = require('../models');
const { Op } = require('sequelize');
const listingService = require('../services/listingService');

// @desc    Get all listings
// @route   GET /api/v1/listings
// @access  Public
exports.getListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  const { count, rows: listings } = await db.Listing.findAndCountAll({
    where: { status: 'active' },
    include: [{
      model: db.User,
      as: 'owner',
      attributes: ['id', 'name', 'profileImage']
    }],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['createdAt', 'DESC']]
  });

  // Process image URLs
  const processedListings = listings.map(listing => {
    const listingJson = listing.toJSON();
    if (listingJson.images && Array.isArray(listingJson.images)) {
      listingJson.images = listingJson.images.map(img => {
        if (img && typeof img === 'string') {
          // If it's already a full URL, return as is
          if (img.startsWith('http')) return img;
          // Otherwise, ensure it's a proper URL
          const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
          return `${baseUrl}/uploads/${img.replace(/^.*[\\/]/, '')}`;
        }
        return img;
      });
    }
    return listingJson;
  });

  res.status(200).json({
    success: true,
    count: processedListings.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: processedListings
  });
});

// @desc    Get single listing
// @route   GET /api/v1/listings/:id
// @access  Public
exports.getListing = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id, {
    include: [{
      model: db.User,
      as: 'owner',
      attributes: ['id', 'name', 'profileImage']
    }]
  });

  if (!listing) {
    return next(new ErrorResponse('Listing not found', 404));
  }

  // Process image URLs
  const listingJson = listing.toJSON();
  if (listingJson.images && Array.isArray(listingJson.images)) {
    listingJson.images = listingJson.images.map(img => {
      if (img && typeof img === 'string') {
        // If it's already a full URL, return as is
        if (img.startsWith('http')) return img;
        // Otherwise, ensure it's a proper URL
        const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}/uploads/${img.replace(/^.*[\\/]/, '')}`;
      }
      return img;
    });
  }

  await listing.increment('viewCount');
  res.status(200).json({ success: true, data: listingJson });
});

// @desc    Create listing
// @route   POST /api/v1/listings
// @access  Private
exports.createListing = asyncHandler(async (req, res) => {
  // Set default status based on user role (admins can create active listings directly)
  const status = req.user.role === 'admin' ? 'active' : 'pending';
  
  const listing = await db.Listing.create({
    ...req.body,
    ownerId: req.user.id,
    status,
    isActive: true,
    currentOccupancy: 0
  });
  
  res.status(201).json({ 
    success: true, 
    message: 'Listing created successfully and is pending approval',
    data: listing 
  });
});

// @desc    Get current user's listings
// @route   GET /api/v1/listings/my-listings
// @access  Private
exports.getMyListings = asyncHandler(async (req, res) => {
  const listings = await db.Listing.findAll({
    where: { ownerId: req.user.id },
    include: [
      {
        model: db.Booking,
        as: 'bookings',
        include: [{
          model: db.User,
          as: 'student',
          attributes: ['id', 'name', 'email', 'phone']
        }]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  res.status(200).json({ success: true, count: listings.length, data: listings });
});

// @desc    Update listing
// @route   PUT /api/v1/listings/:id
// @access  Private
exports.updateListing = asyncHandler(async (req, res, next) => {
  console.log('Update listing endpoint hit');
  console.log('Listing ID:', req.params.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const listing = await db.Listing.findByPk(req.params.id);
  
  if (!listing) {
    console.log('Listing not found');
    return next(new ErrorResponse('Listing not found', 404));
  }

  console.log('Found listing:', listing.id);
  console.log('Listing owner ID:', listing.ownerId);
  console.log('Request user ID:', req.user?.id);
  console.log('Request user role:', req.user?.role);

  if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
    console.log('Not authorized to update this listing');
    return next(new ErrorResponse('Not authorized', 401));
  }

  console.log('Updating listing with data:', req.body);
  await listing.update(req.body);
  
  console.log('Listing updated successfully');
  res.status(200).json({ success: true, data: listing });
});

// @desc    Delete listing
// @route   DELETE /api/v1/listings/:id
// @access  Private
exports.deleteListing = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id, {
    include: [{
      model: db.Booking,
      where: {
        status: { [Op.in]: ['pending', 'approved'] }
      },
      required: false
    }]
  });
  
  if (!listing) {
    return next(new ErrorResponse('Listing not found', 404));
  }
  
  // Make sure user is listing owner or admin
  if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this listing', 401));
  }
  
  // Check for active bookings
  if (listing.bookings && listing.bookings.length > 0) {
    return next(new ErrorResponse('Cannot delete listing with active or pending bookings', 400));
  }
  
  // Soft delete by marking as inactive
  await listing.update({ isActive: false, status: 'inactive' });
  
  res.status(200).json({ 
    success: true, 
    message: 'Listing has been deactivated',
    data: {} 
  });
});

// @desc    Get listing's booking requests
// @route   GET /api/v1/listings/:id/bookings
// @access  Private
exports.getListingBookings = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id);
  
  if (!listing) {
    return next(new ErrorResponse('Listing not found', 404));
  }
  
  // Only listing owner or admin can view bookings
  if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view these bookings', 401));
  }
  
  const bookings = await db.Booking.findAll({
    where: { listingId: req.params.id },
    include: [
      {
        model: db.User,
        as: 'student',
        attributes: ['id', 'name', 'email', 'phone']
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Search listings with filters
// @route   GET /api/v1/listings/search
// @access  Public
exports.searchListings = asyncHandler(async (req, res) => {
  const result = await listingService.listListings({
    page: req.query.page,
    pageSize: req.query.pageSize || req.query.limit,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    propertyType: req.query.propertyType,
    roomType: req.query.roomType,
    status: req.query.status,
    q: req.query.q,
    sort: req.query.sort,
    order: req.query.order,
    lat: req.query.lat ? Number(req.query.lat) : undefined,
    lng: req.query.lng ? Number(req.query.lng) : undefined,
    radiusKm: req.query.radiusKm ? Number(req.query.radiusKm) : undefined,
  });
  res.status(200).json({ success: true, ...result });
});

// @desc    Get listings near a location
// @route   GET /api/v1/listings/nearby
// @access  Public
exports.getNearbyListings = asyncHandler(async (req, res, next) => {
  const { lat, lng, radiusKm = 5 } = req.query;
  if (lat == null || lng == null) {
    return next(new ErrorResponse('lat and lng are required', 400));
  }
  const result = await listingService.listListings({
    ...req.query,
    lat: Number(lat),
    lng: Number(lng),
    radiusKm: Number(radiusKm),
  });
  res.status(200).json({ success: true, ...result });
});

// @desc    Get current user's listings
// @route   GET /api/v1/listings/me
// @access  Private
exports.getMyListings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const { count, rows } = await db.Listing.findAndCountAll({
    where: { ownerId: req.user.id },
    include: [{
      model: db.User,
      as: 'owner',
      attributes: ['id', 'name', 'profileImage']
    }],
    offset: parseInt(offset),
    limit: parseInt(limit),
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    success: true,
    count: rows.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows
  });
});

// @desc    Get listings by owner
// @route   GET /api/v1/listings/user/:userId
// @access  Public
exports.getListingsByUser = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  const { count, rows } = await db.Listing.findAndCountAll({
    where: { ownerId: req.params.userId },
    offset: parseInt(offset),
    limit: parseInt(limit),
    order: [['createdAt', 'DESC']]
  });
  res.status(200).json({
    success: true,
    count: rows.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: rows
  });
});

// @desc    Add images to listing (appends to existing images array)
// @route   POST /api/v1/listings/:id/images
// @access  Private/Homeowner
exports.addListingImages = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id);
  if (!listing) return next(new ErrorResponse('Listing not found', 404));
  if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }
  
  // Convert file paths to relative paths
  const files = (req.files || []).map(f => {
    const fullPath = f.location || f.path || f.filename || f.originalname;
    console.log('Processing file upload:', fullPath);
    
    // If it's already a URL (like from S3), use as is
    if (fullPath.startsWith('http')) {
      return fullPath;
    }
    
    // Convert to relative path if it's a local file
    const relativePath = fullPath
      .replace(/^.*[\\/]public[\\/]/, '') // Remove path up to /public/
      .replace(/^.*[\\/]uploads[\\/]/, '') // Remove path up to /uploads/
      .replace(/\\/g, '/'); // Convert backslashes to forward slashes
      
    console.log('Converted to relative path:', relativePath);
    return relativePath;
  }).filter(Boolean);
  
  const images = [...(listing.images || []), ...files];
  await listing.update({ images });
  
  // Get the updated listing with processed URLs
  const updatedListing = await db.Listing.findByPk(req.params.id);
  const listingJson = updatedListing.toJSON();
  
  // Process image URLs for the response
  if (listingJson.images && Array.isArray(listingJson.images)) {
    listingJson.images = listingJson.images.map(img => {
      if (img && typeof img === 'string') {
        if (img.startsWith('http')) return img;
        const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
        return `${baseUrl}/uploads/${img.replace(/^.*[\\/]/, '')}`;
      }
      return img;
    });
  }
  
  res.status(200).json({ success: true, data: listingJson });
});

// @desc    Delete image from listing
// @route   DELETE /api/v1/listings/:id/images/:imageId
// @access  Private/Homeowner
exports.deleteListingImage = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id);
  if (!listing) return next(new ErrorResponse('Listing not found', 404));
  if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }
  const idx = (listing.images || []).findIndex((img) => String(img) === String(req.params.imageId));
  if (idx === -1) return next(new ErrorResponse('Image not found', 404));
  const images = [...listing.images];
  images.splice(idx, 1);
  await listing.update({ images });
  res.status(200).json({ success: true, data: listing });
});

// @desc    Add to favorites
// @route   POST /api/v1/listings/:id/favorite
// @access  Private
exports.addToFavorites = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id);
  if (!listing) return next(new ErrorResponse('Listing not found', 404));
  await db.Favorite.findOrCreate({ where: { userId: req.user.id, listingId: listing.id } });
  res.status(200).json({ success: true });
});

// @desc    Remove from favorites
// @route   DELETE /api/v1/listings/:id/favorite
// @access  Private
exports.removeFromFavorites = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id);
  if (!listing) return next(new ErrorResponse('Listing not found', 404));
  await db.Favorite.destroy({ where: { userId: req.user.id, listingId: listing.id } });
  res.status(200).json({ success: true });
});

// @desc    Report a listing (placeholder)
// @route   POST /api/v1/listings/:id/report
// @access  Private
exports.reportListing = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Report submitted (placeholder)' });
});

// @desc    Contact owner (placeholder)
// @route   POST /api/v1/listings/:id/contact
// @access  Private
exports.contactOwner = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Message sent (placeholder)' });
});

// @desc    Check listing availability between dates
// @route   GET /api/v1/listings/:id/availability?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return next(new ErrorResponse('startDate and endDate are required', 400));
  }
  
  // Find any conflicting bookings
  const conflicts = await db.Booking.findAll({
    where: {
      listingId: req.params.id,
      status: { [Op.in]: ['approved', 'active'] }, // Removed 'confirmed' as it's not a valid status
      [Op.and]: [
        { startDate: { [Op.lte]: endDate } },
        { endDate: { [Op.gte]: startDate } }
      ]
    },
    order: [['startDate', 'ASC']],
    attributes: ['startDate', 'endDate']
  });

  // If no conflicts, dates are available
  if (conflicts.length === 0) {
    return res.status(200).json({ 
      success: true, 
      available: true,
      message: 'The selected dates are available.'
    });
  }

  // Find the next available date range
  const today = new Date();
  const next90Days = new Date();
  next90Days.setDate(today.getDate() + 90);
  
  // Get all bookings in the next 90 days
  const upcomingBookings = await db.Booking.findAll({
    where: {
      listingId: req.params.id,
      status: { [Op.in]: ['approved', 'active'] }, // Removed 'confirmed' as it's not a valid status
      startDate: { [Op.gte]: today },
      endDate: { [Op.lte]: next90Days }
    },
    order: [['startDate', 'ASC']],
    attributes: ['startDate', 'endDate']
  });

  // Find available date ranges
  const availableRanges = [];
  let currentDate = new Date(today);
  
  // If there are no upcoming bookings, the entire range is available
  if (upcomingBookings.length === 0) {
    availableRanges.push({
      startDate: today.toISOString().split('T')[0],
      endDate: next90Days.toISOString().split('T')[0]
    });
  } else {
    // Check before first booking
    const firstBooking = new Date(upcomingBookings[0].startDate);
    if (currentDate < firstBooking) {
      const dayBeforeFirstBooking = new Date(firstBooking);
      dayBeforeFirstBooking.setDate(dayBeforeFirstBooking.getDate() - 1);
      availableRanges.push({
        startDate: currentDate.toISOString().split('T')[0],
        endDate: dayBeforeFirstBooking.toISOString().split('T')[0]
      });
    }

    // Check between bookings
    for (let i = 0; i < upcomingBookings.length - 1; i++) {
      const currentEnd = new Date(upcomingBookings[i].endDate);
      const nextStart = new Date(upcomingBookings[i + 1].startDate);
      
      // If there's at least one day between bookings
      if (currentEnd < nextStart) {
        const availableStart = new Date(currentEnd);
        availableStart.setDate(availableStart.getDate() + 1);
        const availableEnd = new Date(nextStart);
        availableEnd.setDate(availableEnd.getDate() - 1);
        
        availableRanges.push({
          startDate: availableStart.toISOString().split('T')[0],
          endDate: availableEnd.toISOString().split('T')[0]
        });
      }
    }

    // Check after last booking
    const lastBooking = new Date(upcomingBookings[upcomingBookings.length - 1].endDate);
    if (lastBooking < next90Days) {
      const dayAfterLastBooking = new Date(lastBooking);
      dayAfterLastBooking.setDate(dayAfterLastBooking.getDate() + 1);
      availableRanges.push({
        startDate: dayAfterLastBooking.toISOString().split('T')[0],
        endDate: next90Days.toISOString().split('T')[0]
      });
    }
  }

  // Find the next available date range that can accommodate the requested duration
  const requestedStart = new Date(startDate);
  const requestedEnd = new Date(endDate);
  const requestedNights = Math.ceil((requestedEnd - requestedStart) / (1000 * 60 * 60 * 24));
  
  let nextAvailableDates = null;
  for (const range of availableRanges) {
    const rangeStart = new Date(range.startDate);
    const rangeEnd = new Date(range.endDate);
    const availableNights = Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24));
    
    if (availableNights >= requestedNights) {
      nextAvailableDates = {
        startDate: range.startDate,
        endDate: new Date(rangeStart.getTime() + (requestedNights * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      };
      break;
    }
  }

  // If no range is long enough, find the next available date range with at least 1 night
  if (!nextAvailableDates && availableRanges.length > 0) {
    const firstRange = availableRanges[0];
    nextAvailableDates = {
      startDate: firstRange.startDate,
      endDate: firstRange.startDate
    };
  }

  res.status(200).json({ 
    success: true, 
    available: false,
    message: 'The selected dates are not available.',
    nextAvailableDates,
    availableRanges: availableRanges.slice(0, 3) // Return up to 3 available ranges
  });
});

// @desc    Get category stats counts
// @route   GET /api/v1/listings/categories/stats
// @access  Public
exports.getCategoryStats = asyncHandler(async (req, res) => {
  const results = await db.Listing.findAll({
    attributes: ['propertyType', [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']],
    group: ['propertyType']
  });
  res.status(200).json({ success: true, data: results });
});
