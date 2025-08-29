const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    responseDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    type: {
      type: DataTypes.ENUM('listing', 'user'),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'reviews',
    indexes: [
      {
        fields: ['reviewer_id']
      },
      {
        fields: ['reviewee_id']
      },
      {
        fields: ['listing_id']
      },
      {
        fields: ['booking_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['type']
      },
      {
        fields: ['rating']
      }
    ]
  });

  // Define associations
  Review.associate = (models) => {
    // Review belongs to the user who wrote it
    Review.belongsTo(models.User, {
      foreignKey: 'reviewerId',
      as: 'reviewer',
      onDelete: 'CASCADE'
    });
    
    // Review can be about a user (landlord or tenant)
    Review.belongsTo(models.User, {
      foreignKey: 'revieweeId',
      as: 'reviewee',
      onDelete: 'CASCADE'
    });
    
    // Review is associated with a listing
    Review.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing',
      onDelete: 'CASCADE'
    });
    
    // Review is associated with a booking
    Review.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
      onDelete: 'CASCADE'
    });
  };

  // Update review counts and ratings when a new review is created
  Review.afterCreate(async (review) => {
    if (review.type === 'listing' && review.listingId) {
      await updateListingRating(review.listingId, review.sequelize);
    } else if (review.type === 'user' && review.revieweeId) {
      await updateUserRating(review.revieweeId, review.sequelize);
    }
  });

  // Update review counts and ratings when a review is updated
  Review.afterUpdate(async (review) => {
    if (review.type === 'listing' && review.listingId) {
      await updateListingRating(review.listingId, review.sequelize);
    } else if (review.type === 'user' && review.revieweeId) {
      await updateUserRating(review.revieweeId, review.sequelize);
    }
  });

  // Update review counts and ratings when a review is deleted
  Review.afterDestroy(async (review) => {
    if (review.type === 'listing' && review.listingId) {
      await updateListingRating(review.listingId, review.sequelize);
    } else if (review.type === 'user' && review.revieweeId) {
      await updateUserRating(review.revieweeId, review.sequelize);
    }
  });

  // Helper function to update listing rating
  const updateListingRating = async (listingId, sequelize) => {
    const result = await sequelize.models.Review.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
      ],
      where: {
        listingId,
        type: 'listing',
        status: 'approved'
      },
      raw: true
    });

    if (result) {
      await sequelize.models.Listing.update(
        {
          rating: parseFloat(result.avgRating) || 0,
          reviewCount: parseInt(result.reviewCount) || 0
        },
        { where: { id: listingId } }
      );
    }
  };

  // Helper function to update user rating
  const updateUserRating = async (userId, sequelize) => {
    const result = await sequelize.models.Review.findOne({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'reviewCount']
      ],
      where: {
        revieweeId: userId,
        type: 'user',
        status: 'approved'
      },
      raw: true
    });

    if (result) {
      await sequelize.models.User.update(
        {
          rating: parseFloat(result.avgRating) || 0,
          reviewCount: parseInt(result.reviewCount) || 0
        },
        { where: { id: userId } }
      );
    }
  };

  return Review;
};
