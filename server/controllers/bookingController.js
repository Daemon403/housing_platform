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

// @desc    Create new booking/rental request
// @route   POST /api/v1/bookings
// @access  Private
exports.createBooking = asyncHandler(async (req, res, next) => {
  const { listingId, startDate, endDate, guests, message } = req.body;
  
  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (start < today) {
    return next(new ErrorResponse('Start date cannot be in the past', 400));
  }
  
  if (end <= start) {
    return next(new ErrorResponse('End date must be after start date', 400));
  }
  
  // Check listing availability
  const listing = await db.Listing.findByPk(listingId, {
    include: [{
      model: db.Booking,
      where: {
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          { startDate: { [Op.between]: [start, end] } },
          { endDate: { [Op.between]: [start, end] } },
          { 
            [Op.and]: [
              { startDate: { [Op.lte]: start } },
              { endDate: { [Op.gte]: end } }
            ]
          }
        ]
      },
      required: false
    }]
  });
  
  if (!listing) {
    return next(new ErrorResponse('Listing not found', 404));
  }
  
  if (listing.status !== 'active' || !listing.isActive) {
    return next(new ErrorResponse('This listing is not currently available', 400));
  }
  
  // Check if listing has available space
  if (listing.currentOccupancy >= listing.maximumOccupancy) {
    return next(new ErrorResponse('This property is currently at maximum occupancy', 400));
  }
  
  // Check for existing booking conflicts
  if (listing.bookings && listing.bookings.length > 0) {
    return next(new ErrorResponse('This property is not available for the selected dates', 400));
  }
  
  // Calculate total price based on daily rate and duration
  const durationInDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  const totalPrice = listing.price * durationInDays;
  
  // Create booking request
  const booking = await db.Booking.create({
    listingId,
    studentId: req.user.id,
    startDate: start,
    endDate: end,
    guests: guests || 1,
    totalPrice,
    status: 'pending',
    message: message || ''
  });
  
  // Send notification to property owner
  await db.Notification.create({
    userId: listing.ownerId,
    title: 'New Booking Request',
    message: `You have a new booking request for ${listing.title}`,
    type: 'booking_request',
    referenceId: booking.id
  });
  
  res.status(201).json({
    success: true,
    message: 'Your booking request has been submitted',
    data: booking
  });
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

// @desc    Update booking status (approve/reject/cancel)
// @route   PUT /api/v1/bookings/:id/status
// @access  Private
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status, rejectionReason } = req.body;
  const validStatuses = ['approved', 'rejected', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }
  
  const booking = await db.Booking.findByPk(req.params.id, {
    include: [
      { model: db.Listing, as: 'listing' },
      { model: db.User, as: 'student' }
    ]
  });
  
  if (!booking) {
    return next(new ErrorResponse('Booking not found', 404));
  }
  
  // Authorization check
  const isOwner = booking.listing.ownerId === req.user.id;
  const isStudent = booking.studentId === req.user.id;
  const isAdmin = req.user.role === 'admin';
  
  // Only owner can approve/reject, student can cancel
  if (
    (['approved', 'rejected'].includes(status) && !isOwner && !isAdmin) ||
    (status === 'cancelled' && !isStudent && !isOwner && !isAdmin)
  ) {
    return next(new ErrorResponse('Not authorized to perform this action', 401));
  }
  
  // Status transition validation
  if (
    (booking.status === 'approved' && status === 'rejected') ||
    (booking.status === 'rejected' && status === 'approved') ||
    (booking.status === 'cancelled')
  ) {
    return next(new ErrorResponse(`Cannot change status from ${booking.status} to ${status}`, 400));
  }
  
  // Handle status-specific logic
  const t = await db.sequelize.transaction();
  
  try {
    // Update booking status
    await booking.update({ 
      status,
      ...(rejectionReason && { rejectionReason })
    }, { transaction: t });
    
    // If approved, update listing occupancy
    if (status === 'approved') {
      await booking.listing.increment('currentOccupancy', { transaction: t });
      
      // Reject all other pending bookings for these dates
      await db.Booking.update(
        { 
          status: 'rejected',
          rejectionReason: 'Another booking was approved for these dates'
        },
        {
          where: {
            id: { [Op.ne]: booking.id },
            listingId: booking.listingId,
            status: 'pending',
            [Op.or]: [
              { startDate: { [Op.between]: [booking.startDate, booking.endDate] } },
              { endDate: { [Op.between]: [booking.startDate, booking.endDate] } }
            ]
          },
          transaction: t
        }
      );
      
      // Send notification to student
      await db.Notification.create({
        userId: booking.studentId,
        title: 'Booking Approved',
        message: `Your booking for ${booking.listing.title} has been approved`,
        type: 'booking_update',
        referenceId: booking.id
      }, { transaction: t });
    } 
    // If rejected or cancelled, handle notifications
    else if (['rejected', 'cancelled'].includes(status)) {
      const message = status === 'rejected' 
        ? `Your booking for ${booking.listing.title} was ${rejectionReason ? 'rejected' : 'not approved'}`
        : `Your booking for ${booking.listing.title} has been cancelled`;
      
      if (rejectionReason) {
        message += `: ${rejectionReason}`;
      }
      
      await db.Notification.create({
        userId: status === 'rejected' ? booking.studentId : booking.listing.ownerId,
        title: `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message,
        type: 'booking_update',
        referenceId: booking.id
      }, { transaction: t });
    }
    
    await t.commit();
    
    res.status(200).json({
      success: true,
      message: `Booking has been ${status}`,
      data: booking
    });
    
  } catch (error) {
    await t.rollback();
    next(error);
  }
});

// @desc    Get current user's rental requests (for students)
// @route   GET /api/v1/bookings/my-requests
// @access  Private
exports.getMyRentalRequests = asyncHandler(async (req, res) => {
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
    order: [['createdAt', 'DESC']]
  });
  
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// @desc    Check listing availability
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
