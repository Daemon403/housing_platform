const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const db = require('../models');
const { Op } = require('sequelize');

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
