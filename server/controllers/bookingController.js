const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const db = require('../models');
const { Op } = require('sequelize');

// @desc    Get all bookings (Admin)
// @route   GET /api/v1/bookings
// @access  Private/Admin
exports.getBookings = asyncHandler(async (req, res) => {
  const bookings = await db.Booking.findAll({
    include: [
      { model: db.User, as: 'student', attributes: ['id','name','email'] },
      { model: db.Listing, as: 'listing', attributes: ['id','title'] }
    ],
    order: [['createdAt','DESC']]
  });
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Get current user's bookings
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await db.Booking.findAll({
    where: { studentId: req.user.id },
    include: [
      {
        model: db.Listing,
        as: 'listing',
        include: [{
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'profileImage']
        }]
      }
    ],
    order: [['startDate', 'DESC']]
  });

  res.status(200).json({ success: true, data: bookings });
});

// @desc    Get single booking
// @route   GET /api/v1/bookings/:id
// @access  Private
exports.getBooking = asyncHandler(async (req, res, next) => {
  const booking = await db.Booking.findByPk(req.params.id, {
    include: [
      {
        model: db.User,
        as: 'student',
        attributes: ['id', 'name', 'email', 'phone']
      },
      {
        model: db.Listing,
        as: 'listing',
        include: [{
          model: db.User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }]
      }
    ]
  });

  if (!booking) return next(new ErrorResponse('Booking not found', 404));
  if (booking.studentId !== req.user.id) return next(new ErrorResponse('Not authorized', 401));

  res.status(200).json({ success: true, data: booking });
});

// @desc    Create new booking
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { listingId, startDate, endDate, guests, totalPrice } = req.body;
  
  // Check listing availability
  const listing = await db.Listing.findByPk(listingId);
  if (!listing || listing.status !== 'active') {
    return next(new ErrorResponse('Listing not available', 400));
  }
  
  // Check for existing bookings
  const existingBooking = await db.Booking.findOne({
    where: {
      listingId,
      status: { [Op.in]: ['pending', 'approved'] },
      [Op.or]: [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } }
      ]
    }
  });
  
  if (existingBooking) {
    return next(new ErrorResponse('Listing not available for the selected dates', 400));
  }
  
  // Create booking
  const booking = await db.Booking.create({
    listingId,
    studentId: req.user.id,
    startDate,
    endDate,
    guests,
    totalPrice,
    status: 'pending'
  });

  res.status(201).json({ success: true, data: booking });
});

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const booking = await db.Booking.findByPk(req.params.id);
  
  if (!booking) return next(new ErrorResponse('Booking not found', 404));
  if (booking.studentId !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  if (booking.status !== 'pending') {
    return next(new ErrorResponse('Cannot cancel a booking that is not pending', 400));
  }
  
  booking.status = 'cancelled';
  await booking.save();
  
  res.status(200).json({ success: true, data: booking });
});

// @desc    Approve booking (Homeowner)
// @route   PUT /api/v1/bookings/:id/approve
// @access  Private/Homeowner
exports.approveBooking = asyncHandler(async (req, res, next) => {
  const booking = await db.Booking.findByPk(req.params.id, {
    include: [{ model: db.Listing, as: 'listing' }]
  });
  
  if (!booking) return next(new ErrorResponse('Booking not found', 404));
  if (booking.listing.ownerId !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  if (booking.status !== 'pending') {
    return next(new ErrorResponse('Cannot approve a booking that is not pending', 400));
  }
  
  booking.status = 'approved';
  await booking.save();
  
  res.status(200).json({ success: true, data: booking });
});

// @desc    Check availability
// @route   GET /api/v1/bookings/check-availability
// @access  Public
exports.checkAvailability = asyncHandler(async (req, res) => {
  const { listingId, startDate, endDate } = req.query;
  
  const existingBooking = await db.Booking.findOne({
    where: {
      listingId,
      status: { [Op.in]: ['pending', 'approved'] },
      [Op.or]: [
        { startDate: { [Op.between]: [startDate, endDate] } },
        { endDate: { [Op.between]: [startDate, endDate] } }
      ]
    }
  });
  
  res.status(200).json({
    success: true,
    available: !existingBooking
  });
});

// @desc    Reject booking (Homeowner)
// @route   PUT /api/v1/bookings/:id/reject
// @access  Private/Homeowner
exports.rejectBooking = asyncHandler(async (req, res, next) => {
  const booking = await db.Booking.findByPk(req.params.id, { include: [{ model: db.Listing, as: 'listing' }] });
  if (!booking) return next(new ErrorResponse('Booking not found', 404));
  if (booking.listing.ownerId !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  if (booking.status !== 'pending') return next(new ErrorResponse('Cannot reject non-pending booking', 400));
  booking.status = 'rejected';
  await booking.save();
  res.status(200).json({ success: true, data: booking });
});

// @desc    Complete booking (Homeowner)
// @route   PUT /api/v1/bookings/:id/complete
// @access  Private/Homeowner
exports.completeBooking = asyncHandler(async (req, res, next) => {
  const booking = await db.Booking.findByPk(req.params.id, { include: [{ model: db.Listing, as: 'listing' }] });
  if (!booking) return next(new ErrorResponse('Booking not found', 404));
  if (booking.listing.ownerId !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  if (booking.status !== 'approved' && booking.status !== 'active') return next(new ErrorResponse('Cannot complete this booking', 400));
  booking.status = 'completed';
  await booking.save();
  res.status(200).json({ success: true, data: booking });
});

// @desc    Get bookings for a listing (Homeowner)
// @route   GET /api/v1/bookings/listing/:listingId
// @access  Private/Homeowner
exports.getListingBookings = asyncHandler(async (req, res, next) => {
  const listing = await db.Listing.findByPk(req.params.listingId);
  if (!listing) return next(new ErrorResponse('Listing not found', 404));
  if (listing.ownerId !== req.user.id) return next(new ErrorResponse('Not authorized', 401));
  const bookings = await db.Booking.findAll({ where: { listingId: listing.id }, order: [['createdAt','DESC']] });
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Add review to booking (placeholder)
// @route   POST /api/v1/bookings/:id/review
// @access  Private
exports.addReview = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Review added (placeholder)' });
});

// @desc    Get booking invoice (placeholder)
// @route   GET /api/v1/bookings/:id/invoice
// @access  Private
exports.getInvoice = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: { url: null } });
});

// @desc    Process payment (placeholder)
// @route   POST /api/v1/bookings/:id/payment
// @access  Private
exports.processPayment = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Payment processed (placeholder)' });
});

// @desc    Webhook handler (placeholder)
// @route   POST /api/v1/bookings/webhook
// @access  Public
exports.webhookHandler = asyncHandler(async (req, res) => {
  res.status(200).json({ received: true });
});
