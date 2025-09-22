const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyListings,
  getListingBookings,
  updateListing,
  deleteListing
} = require('../controllers/listingController');

const {
  getMyRentalRequests,
  updateBookingStatus,
  cancelBooking
} = require('../controllers/bookingController');

// Homeowner routes
router.route('/my-listings')
  .get(protect, authorize('homeowner', 'admin'), getMyListings);

router.route('/listings/:id')
  .put(protect, authorize('homeowner', 'admin'), updateListing)
  .delete(protect, authorize('homeowner', 'admin'), deleteListing);

router.route('/listings/:id/bookings')
  .get(protect, authorize('homeowner', 'admin'), getListingBookings);

// Student routes
router.route('/my-rental-requests')
  .get(protect, authorize('student'), getMyRentalRequests);

router.route('/bookings/:id/status')
  .put(protect, updateBookingStatus);

router.route('/bookings/:id/cancel')
  .put(protect, cancelBooking);

module.exports = router;
