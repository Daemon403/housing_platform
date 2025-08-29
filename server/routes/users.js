const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');

const router = express.Router();

// @route   GET /api/v1/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get(
  '/',
  [auth.protect, auth.authorize('admin')],
  userController.getUsers
);

// @route   GET /api/v1/users/:id
// @desc    Get single user by ID
// @access  Private
router.get(
  '/:id',
  auth.protect,
  userController.getUser
);

// @route   PUT /api/v1/users/:id
// @desc    Update user
// @access  Private
router.put(
  '/:id',
  [
    auth.protect,
    // Only admin or account owner can update
    (req, res, next) => {
      if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this user',
        });
      }
      next();
    },
    upload.single('profileImage'),
  ],
  userController.updateUser
);

// @route   DELETE /api/v1/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete(
  '/:id',
  [auth.protect, auth.authorize('admin')],
  userController.deleteUser
);

// @route   GET /api/v1/users/me/listings
// @desc    Get current user's listings
// @access  Private
router.get(
  '/me/listings',
  auth.protect,
  userController.getMyListings
);

// @route   GET /api/v1/users/me/bookings
// @desc    Get current user's bookings
// @access  Private
router.get(
  '/me/bookings',
  auth.protect,
  userController.getMyBookings
);

// @route   GET /api/v1/users/me/reviews
// @desc    Get current user's reviews
// @access  Private
router.get(
  '/me/reviews',
  auth.protect,
  userController.getMyReviews
);

// @route   POST /api/v1/users/me/verify-student
// @desc    Upload student verification documents
// @access  Private
router.post(
  '/me/verify-student',
  [
    auth.protect,
    auth.authorize('student'),
    upload.fields([
      { name: 'studentIdCard', maxCount: 1 },
      { name: 'enrollmentLetter', maxCount: 1 },
    ]),
  ],
  userController.verifyStudent
);

// @route   POST /api/v1/users/me/verify-homeowner
// @desc    Upload homeowner verification documents
// @access  Private
router.post(
  '/me/verify-homeowner',
  [
    auth.protect,
    auth.authorize('homeowner'),
    upload.fields([
      { name: 'idCard', maxCount: 1 },
      { name: 'proofOfOwnership', maxCount: 1 },
      { name: 'utilityBill', maxCount: 1 },
    ]),
  ],
  userController.verifyHomeowner
);

// @route   GET /api/v1/users/me/conversations
// @desc    Get user's conversations
// @access  Private
router.get(
  '/me/conversations',
  auth.protect,
  userController.getMyConversations
);

// @route   GET /api/v1/users/me/notifications
// @desc    Get user's notifications
// @access  Private
router.get(
  '/me/notifications',
  auth.protect,
  userController.getMyNotifications
);

// @route   PUT /api/v1/users/me/notifications/mark-read
// @desc    Mark notifications as read
// @access  Private
router.put(
  '/me/notifications/mark-read',
  auth.protect,
  userController.markNotificationsAsRead
);

// @route   POST /api/v1/users/me/favorites/:listingId
// @desc    Add listing to favorites
// @access  Private
router.post(
  '/me/favorites/:listingId',
  auth.protect,
  userController.addToFavorites
);

// @route   DELETE /api/v1/users/me/favorites/:listingId
// @desc    Remove listing from favorites
// @access  Private
router.delete(
  '/me/favorites/:listingId',
  auth.protect,
  userController.removeFromFavorites
);

// @route   GET /api/v1/users/me/favorites
// @desc    Get user's favorite listings
// @access  Private
router.get(
  '/me/favorites',
  auth.protect,
  userController.getFavorites
);

// @route   GET /api/v1/users/me/payments
// @desc    Get user's payment history
// @access  Private
router.get(
  '/me/payments',
  auth.protect,
  userController.getPaymentHistory
);

// @route   POST /api/v1/users/me/payment-methods
// @desc    Add a payment method
// @access  Private
router.post(
  '/me/payment-methods',
  auth.protect,
  userController.addPaymentMethod
);

// @route   DELETE /api/v1/users/me/payment-methods/:paymentMethodId
// @desc    Remove a payment method
// @access  Private
router.delete(
  '/me/payment-methods/:paymentMethodId',
  auth.protect,
  userController.removePaymentMethod
);

module.exports = router;
