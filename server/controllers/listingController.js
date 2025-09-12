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

  res.status(200).json({
    success: true,
    count: listings.length,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    data: listings
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

  await listing.increment('viewCount');
  res.status(200).json({ success: true, data: listing });
});

// @desc    Create listing
// @route   POST /api/v1/listings
// @access  Private
exports.createListing = asyncHandler(async (req, res) => {
  const listing = await db.Listing.create({
    ...req.body,
    ownerId: req.user.id
  });
  res.status(201).json({ success: true, data: listing });
});

// @desc    Update listing
// @route   PUT /api/v1/listings/:id
// @access  Private
exports.updateListing = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id);
  
  if (!listing) {
    return next(new ErrorResponse('Listing not found', 404));
  }

  if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }

  await listing.update(req.body);
  res.status(200).json({ success: true, data: listing });
});

// @desc    Delete listing
// @route   DELETE /api/v1/listings/:id
// @access  Private
exports.deleteListing = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.id);
  
  if (!listing) {
    return next(new ErrorResponse('Listing not found', 404));
  }

  if (listing.ownerId !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized', 401));
  }

  await listing.destroy();
  res.status(200).json({ success: true, data: {} });
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
  const files = (req.files || []).map(f => f.location || f.path || f.filename || f.originalname).filter(Boolean);
  const images = [...(listing.images || []), ...files];
  await listing.update({ images });
  res.status(200).json({ success: true, data: listing });
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
  const conflicts = await db.Booking.count({
    where: {
      listingId: req.params.id,
      status: { [Op.in]: ['approved', 'active'] },
      [Op.and]: [
        { startDate: { [Op.lte]: endDate } },
        { endDate: { [Op.gte]: startDate } }
      ]
    }
  });
  res.status(200).json({ success: true, available: conflicts === 0 });
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
