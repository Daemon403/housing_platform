const crypto = require('crypto');
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const db = require('../models');
const logger = require('../utils/logger');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  const { name, email, password, role, phone, university, studentId } = req.body;

  try {
    // Create user
    const user = await db.User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
      university,
      studentId
    });

    // Create verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validate: false });

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    const message = `
      <h1>Email Verification</h1>
      <p>Please verify your email by clicking on the following link:</p>
      <a href="${verificationUrl}" target="_blank">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Email Verification',
        html: message
      });

      sendTokenResponse(user, 200, res);
    } catch (err) {
      logger.error(`Error sending verification email: ${err.message}`);
      
      // Still send token even if email fails
      sendTokenResponse(user, 200, res);
    }
  } catch (err) {
    logger.error(`Registration error: ${err.message}`);
    
    // Handle duplicate email
    if (err.name === 'SequelizeUniqueConstraintError') {
      const message = 'Email already exists';
      return next(new ErrorResponse(message, 400));
    }
    
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  try {
    // Check for user
    const user = await db.User.findOne({
      where: { email },
      attributes: { include: ['password'] } // Include password for verification
    });

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if account is verified
    if (!user.isVerified && user.role !== 'admin') {
      return next(
        new ErrorResponse('Please verify your email before logging in', 401)
      );
    }

    // Check if account is active
    if (user.status !== 'active') {
      return next(
        new ErrorResponse('Your account has been suspended. Please contact support.', 401)
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    university: req.body.university,
    studentId: req.body.studentId
  };

  try {
    const user = await db.User.findByPk(req.user.id);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Update user
    await user.update(fieldsToUpdate);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { include: ['password'] }
    });

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await db.User.findOne({ where: { email } });

    if (!user) {
      return next(new ErrorResponse('No user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validate: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

    const message = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Token',
        html: message
      });

      res.status(200).json({ success: true, data: 'Email sent' });
    } catch (err) {
      logger.error(`Error sending email: ${err.message}`);
      
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validate: false });

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  try {
    const user = await db.User.findOne({
      where: {
        resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token or token expired', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Verify email
// @route   GET /api/v1/auth/verifyemail/:verificationtoken
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationtoken)
    .digest('hex');

  try {
    const user = await db.User.findOne({
      where: {
        verificationToken,
        isVerified: false
      }
    });

    if (!user) {
      return next(new ErrorResponse('Invalid token or email already verified', 400));
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: 'Email verified successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout / clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      data: user
    });
};
