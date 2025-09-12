const { DataTypes } = require('sequelize');
const slugify = require('slugify');

module.exports = (sequelize) => {
  const Listing = sequelize.define('Listing', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true
    },
    slug: {
      type: DataTypes.STRING,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    propertyType: {
      type: DataTypes.ENUM('apartment', 'house', 'condo', 'townhouse', 'room', 'other'),
      allowNull: false
    },
    roomType: {
      type: DataTypes.ENUM('entire-place', 'private-room', 'shared-room'),
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    deposit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    minStayMonths: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    maxOccupants: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    bathrooms: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER, // in square meters
      allowNull: false
    },
    isFurnished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasParking: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasWifi: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasKitchen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasAirConditioning: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasHeating: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasWasher: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasTv: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasDesk: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPetFriendly: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isSmokingAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasPrivateBathroom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hasSecurityDeposit: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    utilitiesIncluded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    address: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    // Store location as JSON { lat: number, lng: number } to avoid PostGIS dependency
    location: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    rules: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    amenities: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'rejected', 'sold', 'inactive'),
      defaultValue: 'pending'
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    reviewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'listings',
    indexes: [
      {
        fields: ['location']
      },
      {
        fields: ['status']
      },
      {
        fields: ['price']
      },
      {
        fields: ['property_type']
      },
      {
        fields: ['room_type']
      }
    ]
  });

  // Generate slug from title before creating/updating
  Listing.beforeValidate((listing) => {
    if (listing.title) {
      listing.slug = slugify(listing.title, {
        lower: true,
        strict: true
      }) + '-' + Math.random().toString(36).substring(2, 7);
    }
  });

  // Define associations
  Listing.associate = (models) => {
    Listing.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner',
      onDelete: 'CASCADE'
    });
    
    Listing.hasMany(models.Booking, {
      foreignKey: 'listingId',
      as: 'bookings'
    });
    
    Listing.hasMany(models.Review, {
      foreignKey: 'listingId',
      as: 'reviews'
    });
    
    Listing.hasMany(models.MaintenanceRequest, {
      foreignKey: 'listingId',
      as: 'maintenanceRequests'
    });
  };

  return Listing;
};
