const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending',    // Booking request sent, waiting for approval
        'approved',   // Homeowner approved the booking
        'rejected',   // Homeowner rejected the booking
        'cancelled',  // Either party cancelled before check-in
        'active',     // Currently active (check-in date reached)
        'completed',  // Stay completed successfully
        'terminated'  // Early termination
      ),
      defaultValue: 'pending'
    },
    paymentStatus: {
      type: DataTypes.ENUM(
        'pending',    // Payment not yet initiated
        'partial',    // Partial payment received
        'paid',       // Full payment received
        'refunded',   // Full refund issued
        'partially_refunded', // Partial refund issued
        'failed'      // Payment failed
      ),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancellationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    termsAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    contractSigned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    contractUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contractSignedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'bookings',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['start_date']
      },
      {
        fields: ['end_date']
      },
      {
        fields: ['student_id']
      },
      {
        fields: ['listing_id']
      }
    ]
  });

  // Define associations
  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'studentId',
      as: 'student',
      onDelete: 'CASCADE'
    });
    
    Booking.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing',
      onDelete: 'CASCADE'
    });
    
    // Self-referential relationship for booking modifications
    Booking.belongsTo(models.Booking, {
      foreignKey: 'previousBookingId',
      as: 'previousBooking'
    });
    
    Booking.hasMany(models.Payment, {
      foreignKey: 'bookingId',
      as: 'payments'
    });
    
    Booking.hasOne(models.Review, {
      foreignKey: 'bookingId',
      as: 'review'
    });
  };

  // Add instance methods
  Booking.prototype.getTotalNights = function() {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  Booking.prototype.isActive = function() {
    const now = new Date();
    return new Date(this.startDate) <= now && new Date(this.endDate) >= now;
  };

  Booking.prototype.isUpcoming = function() {
    return new Date(this.startDate) > new Date();
  };

  Booking.prototype.isCompleted = function() {
    return new Date(this.endDate) < new Date();
  };

  return Booking;
};
