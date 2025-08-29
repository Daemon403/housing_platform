const express = require('express');
const { check } = require('express-validator');
const listingController = require('../controllers/listingController');
const auth = require('../middleware/auth');
const { upload } = require('../utils/fileUpload');

const router = express.Router();

// @route   GET /api/v1/listings
// @desc    Get all listings
// @access  Public
router.get('/', listingController.getListings);

// @route   GET /api/v1/listings/:id
// @desc    Get single listing
// @access  Public
router.get('/:id', listingController.getListing);

// @route   POST /api/v1/listings
// @desc    Create new listing
// @access  Private/Homeowner
router.post(
  '/',
  [
    auth.protect,
    auth.authorize('homeowner'),
    upload.array('images', 10), // Max 10 images
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('propertyType', 'Property type is required').isIn([
        'apartment', 'house', 'condo', 'townhouse', 'room', 'other'
      ]),
      check('roomType', 'Room type is required').isIn([
        'entire-place', 'private-room', 'shared-room'
      ]),
      check('price', 'Price is required').isNumeric(),
      check('bedrooms', 'Number of bedrooms is required').isInt({ min: 0 }),
      check('bathrooms', 'Number of bathrooms is required').isFloat({ min: 0.5 }),
      check('maxOccupants', 'Maximum number of occupants is required').isInt({ min: 1 }),
      check('availableFrom', 'Available from date is required').isISO8601(),
      check('address', 'Address is required').isObject(),
      check('address.street', 'Street is required').not().isEmpty(),
      check('address.city', 'City is required').not().isEmpty(),
      check('address.state', 'State is required').not().isEmpty(),
      check('address.postalCode', 'Postal code is required').not().isEmpty(),
      check('address.country', 'Country is required').not().isEmpty(),
      check('location', 'Location coordinates are required').isObject(),
      check('location.lat', 'Latitude is required').isFloat(),
      check('location.lng', 'Longitude is required').isFloat()
    ]
  ],
  listingController.createListing
);

// @route   PUT /api/v1/listings/:id
// @desc    Update listing
// @access  Private/Homeowner
router.put(
  '/:id',
  [
    auth.protect,
    auth.authorize('homeowner'),
    upload.array('images', 10), // Max 10 images
    [
      check('title', 'Title is required').optional().not().isEmpty(),
      check('description', 'Description is required').optional().not().isEmpty(),
      check('propertyType', 'Invalid property type').optional().isIn([
        'apartment', 'house', 'condo', 'townhouse', 'room', 'other'
      ]),
      check('roomType', 'Invalid room type').optional().isIn([
        'entire-place', 'private-room', 'shared-room'
      ]),
      check('price', 'Price must be a number').optional().isNumeric(),
      check('bedrooms', 'Number of bedrooms must be an integer').optional().isInt({ min: 0 }),
      check('bathrooms', 'Number of bathrooms must be a number').optional().isFloat({ min: 0.5 }),
      check('maxOccupants', 'Maximum number of occupants must be an integer').optional().isInt({ min: 1 }),
      check('availableFrom', 'Invalid date format').optional().isISO8601(),
      check('address', 'Address must be an object').optional().isObject(),
      check('location', 'Location must be an object').optional().isObject(),
      check('location.lat', 'Latitude must be a number').optional().isFloat(),
      check('location.lng', 'Longitude must be a number').optional().isFloat()
    ]
  ],
  listingController.updateListing
);

// @route   DELETE /api/v1/listings/:id
// @desc    Delete listing
// @access  Private/Homeowner
router.delete(
  '/:id',
  [auth.protect, auth.authorize('homeowner')],
  listingController.deleteListing
);

// @route   POST /api/v1/listings/:id/images
// @desc    Add images to listing
// @access  Private/Homeowner
router.post(
  '/:id/images',
  [
    auth.protect,
    auth.authorize('homeowner'),
    upload.array('images', 10) // Max 10 images per upload
  ],
  listingController.addListingImages
);

// @route   DELETE /api/v1/listings/:id/images/:imageId
// @desc    Delete listing image
// @access  Private/Homeowner
router.delete(
  '/:id/images/:imageId',
  [auth.protect, auth.authorize('homeowner')],
  listingController.deleteListingImage
);

// @route   GET /api/v1/listings/user/:userId
// @desc    Get all listings by user
// @access  Public
router.get('/user/:userId', listingController.getListingsByUser);

// @route   GET /api/v1/listings/search
// @desc    Search listings with filters
// @access  Public
router.get('/search', listingController.searchListings);

// @route   POST /api/v1/listings/:id/favorite
// @desc    Add listing to favorites
// @access  Private
router.post(
  '/:id/favorite',
  auth.protect,
  listingController.addToFavorites
);

// @route   DELETE /api/v1/listings/:id/favorite
// @desc    Remove listing from favorites
// @access  Private
router.delete(
  '/:id/favorite',
  auth.protect,
  listingController.removeFromFavorites
);

// @route   GET /api/v1/listings/nearby
// @desc    Get listings near a location
// @access  Public
router.get('/nearby', listingController.getNearbyListings);

// @route   POST /api/v1/listings/:id/report
// @desc    Report a listing
// @access  Private
router.post(
  '/:id/report',
  [
    auth.protect,
    [
      check('reason', 'Please provide a reason for reporting').not().isEmpty(),
      check('description', 'Please provide a description').optional().isLength({ max: 1000 })
    ]
  ],
  listingController.reportListing
);

// @route   POST /api/v1/listings/:id/contact
// @desc    Contact listing owner
// @access  Private
router.post(
  '/:id/contact',
  [
    auth.protect,
    [
      check('message', 'Message is required').not().isEmpty(),
      check('startDate', 'Start date is required for booking inquiries').optional().isISO8601(),
      check('endDate', 'End date is required for booking inquiries').optional().isISO8601()
    ]
  ],
  listingController.contactOwner
);

// @route   GET /api/v1/listings/:id/availability
// @desc    Check listing availability
// @access  Public
router.get('/:id/availability', listingController.checkAvailability);

// @route   GET /api/v1/listings/categories/stats
// @desc    Get listing statistics by category
// @access  Public
router.get('/categories/stats', listingController.getCategoryStats);

module.exports = router;
