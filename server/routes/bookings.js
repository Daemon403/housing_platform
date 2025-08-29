const express = require('express');
const { check } = require('express-validator');
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/v1/bookings
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
router.get(
  '/',
  [auth.protect, auth.authorize('admin')],
  bookingController.getBookings
);

// @route   GET /api/v1/bookings/my-bookings
// @desc    Get current user's bookings
// @access  Private
router.get(
  '/my-bookings',
  auth.protect,
  bookingController.getMyBookings
);

// @route   GET /api/v1/bookings/:id
// @desc    Get single booking
// @access  Private
router.get(
  '/:id',
  auth.protect,
  bookingController.getBooking
);

// @route   POST /api/v1/listings/:listingId/bookings
// @desc    Create new booking
// @access  Private
router.post(
  '/',
  [
    auth.protect,
    [
      check('listingId', 'Listing ID is required').not().isEmpty(),
      check('startDate', 'Start date is required').isISO8601(),
      check('endDate', 'End date is required').isISO8601(),
      check('guests', 'Number of guests is required').isInt({ min: 1 }),
      check('totalPrice', 'Total price is required').isNumeric(),
      check('paymentMethod', 'Payment method is required').not().isEmpty()
    ]
  ],
  bookingController.createBooking
);

// @route   PUT /api/v1/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put(
  '/:id/cancel',
  auth.protect,
  bookingController.cancelBooking
);

// @route   PUT /api/v1/bookings/:id/approve
// @desc    Approve booking (Homeowner only)
// @access  Private/Homeowner
router.put(
  '/:id/approve',
  [auth.protect, auth.authorize('homeowner')],
  bookingController.approveBooking
);

// @route   PUT /api/v1/bookings/:id/reject
// @desc    Reject booking (Homeowner only)
// @access  Private/Homeowner
router.put(
  '/:id/reject',
  [auth.protect, auth.authorize('homeowner')],
  bookingController.rejectBooking
);

// @route   PUT /api/v1/bookings/:id/complete
// @desc    Mark booking as completed
// @access  Private/Homeowner
router.put(
  '/:id/complete',
  [auth.protect, auth.authorize('homeowner')],
  bookingController.completeBooking
);

// @route   GET /api/v1/bookings/listing/:listingId
// @desc    Get bookings for a listing (Homeowner only)
// @access  Private/Homeowner
router.get(
  '/listing/:listingId',
  [auth.protect, auth.authorize('homeowner')],
  bookingController.getListingBookings
);

// @route   GET /api/v1/bookings/check-availability
// @desc    Check listing availability
// @access  Public
router.get(
  '/check-availability',
  [
    check('listingId', 'Listing ID is required').not().isEmpty(),
    check('startDate', 'Start date is required').isISO8601(),
    check('endDate', 'End date is required').isISO8601()
  ],
  bookingController.checkAvailability
);

// @route   POST /api/v1/bookings/:id/review
// @desc    Add review to booking
// @access  Private
router.post(
  '/:id/review',
  [
    auth.protect,
    [
      check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
      check('comment', 'Comment is required').not().isEmpty()
    ]
  ],
  bookingController.addReview
);

// @route   GET /api/v1/bookings/:id/invoice
// @desc    Get booking invoice
// @access  Private
router.get(
  '/:id/invoice',
  auth.protect,
  bookingController.getInvoice
);

// @route   POST /api/v1/bookings/:id/payment
// @desc    Process payment for booking
// @access  Private
router.post(
  '/:id/payment',
  [
    auth.protect,
    [
      check('paymentMethodId', 'Payment method ID is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric()
    ]
  ],
  bookingController.processPayment
);

// @route   POST /api/v1/bookings/webhook
// @desc    Webhook for payment processing
// @access  Public
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  bookingController.webhookHandler
);

module.exports = router;
