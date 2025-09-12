const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD',
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentProvider: {
      type: DataTypes.ENUM(
        'stripe',
        'paystack',
        'paypal',
        'bank_transfer',
        'mobile_money',
        'other'
      ),
      allowNull: false
    },
    paymentIntentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(
        'pending',        // Payment created but not yet processed
        'requires_action', // Additional authentication required
        'processing',     // Payment is being processed
        'succeeded',      // Payment completed successfully
        'failed',         // Payment failed
        'canceled',       // Payment was canceled
        'refunded',       // Payment was refunded
        'partially_refunded', // Partial refund was issued
        'disputed',       // Payment is being disputed
        'voided'          // Payment was voided
      ),
      defaultValue: 'pending'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    receiptUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    failureCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    failureMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    // For tracking refunds
    amountRefunded: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // For escrow or scheduled payments
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // For tracking payment method details
    paymentMethodDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // For tracking fees
    applicationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    // For tracking payment source
    sourceType: {
      type: DataTypes.ENUM('card', 'bank_account', 'wallet', 'other'),
      allowNull: true
    },
    sourceId: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'payments',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['user_id']
      },
      {
        fields: ['booking_id']
      },
      {
        fields: ['payment_intent_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['payment_provider']
      }
    ]
  });

  // Define associations
  Payment.associate = (models) => {
    // Payment is made by a user
    Payment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'SET NULL'
    });
    
    // Payment is associated with a booking
    Payment.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
      onDelete: 'SET NULL'
    });
    
    // Payment can be associated with a listing
    Payment.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing',
      onDelete: 'SET NULL'
    });
    
    // Payment can have refunds
    Payment.hasMany(models.Refund, {
      foreignKey: 'paymentId',
      as: 'refunds'
    });
    
    // Payment can have disputes
    Payment.hasMany(models.Dispute, {
      foreignKey: 'paymentId',
      as: 'disputes'
    });
  };
  
  // Instance methods
  Payment.prototype.getNetAmount = function() {
    return this.amount - (this.applicationFee || 0) - (this.tax || 0);
  };
  
  Payment.prototype.getRefundableAmount = function() {
    return this.amount - this.amountRefunded;
  };
  
  Payment.prototype.isRefundable = function() {
    return this.status === 'succeeded' && this.getRefundableAmount() > 0;
  };
  
  // Hooks
  Payment.afterUpdate(async (payment) => {
    if (!payment.changed('status')) return;

    if (!payment.bookingId) return;

    const Booking = payment.sequelize.models.Booking;
    const booking = await Booking.findByPk(payment.bookingId);
    if (!booking) return;

    // Map payment.status to booking.paymentStatus
    const map = {
      succeeded: 'paid',
      refunded: 'refunded',
      partially_refunded: 'partially_refunded',
      failed: 'failed'
    };

    const nextPaymentStatus = map[payment.status];
    if (nextPaymentStatus) {
      await booking.update({ paymentStatus: nextPaymentStatus });
    }
  });

  return Payment;
};
