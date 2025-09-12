const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const db = require('../models');

// Admin: list users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await db.User.findAll({ limit: 100, order: [['createdAt', 'DESC']] });
  res.status(200).json({ success: true, count: users.length, data: users });
});

// Get single user
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await db.User.findByPk(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  res.status(200).json({ success: true, data: user });
});

// Update user (self or admin)
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await db.User.findByPk(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));

  const updatable = [
    'name','email','phone','profileImage','university','address','preferences','status'
  ];
  const payload = {};
  updatable.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });
  await user.update(payload);
  res.status(200).json({ success: true, data: user });
});

// Delete user (admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await db.User.findByPk(req.params.id);
  if (!user) return next(new ErrorResponse('User not found', 404));
  await user.destroy();
  res.status(200).json({ success: true, data: {} });
});

// Current user's listings
exports.getMyListings = asyncHandler(async (req, res) => {
  const listings = await db.Listing.findAll({ where: { ownerId: req.user.id }, order: [['createdAt','DESC']] });
  res.status(200).json({ success: true, count: listings.length, data: listings });
});

// Current user's bookings
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await db.Booking.findAll({ where: { studentId: req.user.id }, order: [['createdAt','DESC']] });
  res.status(200).json({ success: true, count: bookings.length, data: bookings });
});

// Current user's reviews
exports.getMyReviews = asyncHandler(async (req, res) => {
  const given = await db.Review.findAll({ where: { reviewerId: req.user.id }, order: [['createdAt','DESC']] });
  const received = await db.Review.findAll({ where: { revieweeId: req.user.id }, order: [['createdAt','DESC']] });
  res.status(200).json({ success: true, data: { given, received } });
});

// Verification placeholders
exports.verifyStudent = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Student verification uploaded (placeholder)' });
});
exports.verifyHomeowner = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Homeowner verification uploaded (placeholder)' });
});

// Conversations placeholder (join table participants not modeled here)
exports.getMyConversations = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: [] });
});

// Notifications placeholders
exports.getMyNotifications = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: [] });
});
exports.markNotificationsAsRead = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true });
});

// Favorites placeholders
exports.addToFavorites = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Favorited (placeholder)' });
});
exports.removeFromFavorites = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Unfavorited (placeholder)' });
});
exports.getFavorites = asyncHandler(async (req, res) => {
  const rows = await db.Favorite.findAll({
    where: { userId: req.user.id },
    include: [{ model: db.Listing, as: 'listing' }],
    order: [['created_at', 'DESC']]
  });
  const listings = rows.map(r => r.listing).filter(Boolean);
  res.status(200).json({ success: true, count: listings.length, data: listings });
});

// Payments
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await db.Payment.findAll({ where: { userId: req.user.id }, order: [['createdAt','DESC']] });
  res.status(200).json({ success: true, count: payments.length, data: payments });
});

// Payment methods placeholders
exports.addPaymentMethod = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Payment method added (placeholder)' });
});
exports.removePaymentMethod = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Payment method removed (placeholder)' });
});
