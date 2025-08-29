const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM(
        'plumbing',
        'electrical',
        'appliance',
        'heating_cooling',
        'pest_control',
        'furniture',
        'security',
        'cleaning',
        'other'
      ),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'emergency'),
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM(
        'submitted',    // Request created by student
        'in_review',    // Homeowner is reviewing
        'scheduled',    // Repair scheduled
        'in_progress',  // Work in progress
        'awaiting_parts', // Waiting for parts
        'completed',    // Work completed
        'rejected',     // Request rejected
        'cancelled'     // Request cancelled
      ),
      defaultValue: 'submitted'
    },
    preferredDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    preferredTime: {
      type: DataTypes.STRING,
      allowNull: true
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    costEstimate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    actualCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resolutionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'maintenance_requests',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['category']
      },
      {
        fields: ['requester_id']
      },
      {
        fields: ['listing_id']
      },
      {
        fields: ['booking_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Define associations
  MaintenanceRequest.associate = (models) => {
    // Request is created by a user (student)
    MaintenanceRequest.belongsTo(models.User, {
      foreignKey: 'requesterId',
      as: 'requester',
      onDelete: 'CASCADE'
    });
    
    // Request is assigned to a listing
    MaintenanceRequest.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing',
      onDelete: 'CASCADE'
    });
    
    // Optional: Link to a specific booking
    MaintenanceRequest.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
      onDelete: 'SET NULL'
    });
    
    // Optional: Assigned to a vendor or staff member
    MaintenanceRequest.belongsTo(models.User, {
      foreignKey: 'assignedToId',
      as: 'assignedTo',
      onDelete: 'SET NULL'
    });
    
    // Maintenance updates/history
    MaintenanceRequest.hasMany(models.MaintenanceUpdate, {
      foreignKey: 'requestId',
      as: 'updates'
    });
  };

  // Instance methods
  MaintenanceRequest.prototype.getStatusHistory = async function() {
    return await this.sequelize.models.MaintenanceUpdate.findAll({
      where: { requestId: this.id },
      order: [['createdAt', 'DESC']]
    });
  };

  // Hooks for status changes
  MaintenanceRequest.afterUpdate(async (request, options) => {
    if (request.changed('status')) {
      await request.sequelize.models.MaintenanceUpdate.create({
        requestId: request.id,
        status: request.status,
        notes: `Status changed to ${request.status}`,
        createdById: options.userId || null // Track who made the change if available
      });
    }
  });

  return MaintenanceRequest;
};
