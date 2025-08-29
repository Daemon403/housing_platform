const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    check('role', 'Please include a valid role').isIn(['student', 'homeowner']),
  ],
  authController.register
);

// @route   POST /api/v1/auth/login
// @desc    Login user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  authController.login
);

// @route   GET /api/v1/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', auth.protect, authController.getMe);

// @route   PUT /api/v1/auth/updatedetails
// @desc    Update user details
// @access  Private
router.put('/updatedetails', auth.protect, authController.updateDetails);

// @route   PUT /api/v1/auth/updatepassword
// @desc    Update password
// @access  Private
router.put(
  '/updatepassword',
  [
    auth.protect,
    [
      check('currentPassword', 'Please enter current password').exists(),
      check('newPassword', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    ],
  ],
  authController.updatePassword
);

// @route   POST /api/v1/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post(
  '/forgotpassword',
  [check('email', 'Please include a valid email').isEmail()],
  authController.forgotPassword
);

// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @desc    Reset password
// @access  Public
router.put(
  '/resetpassword/:resettoken',
  [check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })],
  authController.resetPassword
);

// @route   GET /api/v1/auth/verifyemail/:verificationtoken
// @desc    Verify email
// @access  Public
router.get('/verifyemail/:verificationtoken', authController.verifyEmail);

// @route   GET /api/v1/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.get('/logout', auth.protect, authController.logout);

module.exports = router;
