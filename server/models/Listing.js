const { DataTypes, Op } = require('sequelize');
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
    // Listing status lifecycle: pending -> (approved|rejected) -> active -> (inactive|sold)
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'active', 'inactive', 'sold', 'under_maintenance'),
      defaultValue: 'pending',
      validate: {
        isValidTransition(value) {
          const validTransitions = {
            pending: ['approved', 'rejected'],
            approved: ['active', 'rejected'],
            rejected: ['pending'],
            active: ['inactive', 'sold', 'under_maintenance'],
            inactive: ['active', 'sold'],
            under_maintenance: ['active', 'inactive'],
            sold: [] // Terminal state
          };
          
          if (this.previous('status') && !validTransitions[this.previous('status')].includes(value)) {
            throw new Error(`Invalid status transition from ${this.previous('status')} to ${value}`);
          }
        }
      }
    },
    // Soft delete flag
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    // Room capacity tracking
    maximumOccupancy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 20,
        isLessThanMaxOccupants(value) {
          if (this.maxOccupants && value > this.maxOccupants) {
            throw new Error('Maximum occupancy cannot be greater than max occupants');
          }
        }
      }
    },
    currentOccupancy: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        isLessThanMax(value) {
          if (this.maximumOccupancy && value > this.maximumOccupancy) {
            throw new Error('Current occupancy cannot exceed maximum occupancy');
          }
        }
      }
    },
    // Extended features as JSON for flexibility
    features: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidFeatures(value) {
          if (typeof value !== 'object' || value === null) {
            throw new Error('Features must be an object');
          }
        }
      }
    },
    // Utilities and financials
    utilitiesIncluded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    depositRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 0,
        isDepositValid(value) {
          if (this.depositRequired && (!value || value <= 0)) {
            throw new Error('Deposit amount is required when deposit is required');
          }
        }
      }
    },
    // Lease terms in months
    leaseTerms: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [6, 12],
      validate: {
        isValidLeaseTerms(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('Lease terms must be a non-empty array');
          }
          if (!value.every(term => Number.isInteger(term) && term > 0)) {
            throw new Error('All lease terms must be positive integers');
          }
          if (value.some(term => term % 6 !== 0)) {
            throw new Error('Lease terms must be in multiples of 6 months');
          }
        }
      }
    },
    // Approval tracking
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isRejectionReasonRequired(value) {
          if (this.status === 'rejected' && (!value || value.trim() === '')) {
            throw new Error('Rejection reason is required when status is rejected');
          }
        }
      }
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users', // This should match the actual table name for users
        key: 'id'
      }
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
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
    paranoid: true, // Enables soft deletes
    defaultScope: {
      where: {
        isActive: true
      }
    },
    scopes: {
      active: {
        where: { isActive: true, status: 'active' }
      },
      pending: {
        where: { status: 'pending' }
      },
      available: {
        where: {
          status: 'active',
          isActive: true,
          [Op.and]: [
            sequelize.literal('"currentOccupancy" < "maximumOccupancy"')
          ]
        }
      }
    },
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

  // Handle status transitions and related validations
  Listing.beforeUpdate(async (listing) => {
    // Set approvedAt when status changes to approved
    if (listing.changed('status') && listing.status === 'approved') {
      listing.approvedAt = new Date();
    }
    
    // When a listing is deactivated, ensure it's not marked as active
    if (listing.changed('isActive') && !listing.isActive) {
      listing.status = 'inactive';
    }
  });

  // Instance methods
  Listing.prototype.isAvailable = function() {
    return this.status === 'active' && 
           this.isActive && 
           this.currentOccupancy < this.maximumOccupancy;
  };

  Listing.prototype.incrementOccupancy = async function(amount = 1) {
    if (this.currentOccupancy + amount > this.maximumOccupancy) {
      throw new Error('Exceeds maximum occupancy');
    }
    this.currentOccupancy += amount;
    return this.save();
  };

  Listing.prototype.decrementOccupancy = async function(amount = 1) {
    if (this.currentOccupancy - amount < 0) {
      throw new Error('Cannot have negative occupancy');
    }
    this.currentOccupancy -= amount;
    return this.save();
  };

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
