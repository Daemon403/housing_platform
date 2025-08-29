const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const db = require('../models');
const { Op } = require('sequelize');

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
      status: { [Op.in]: ['pending', 'confirmed'] },
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
  
  booking.status = 'confirmed';
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
      status: { [Op.in]: ['pending', 'confirmed'] },
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
