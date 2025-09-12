const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MaintenanceUpdate = sequelize.define('MaintenanceUpdate', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'submitted',
        'in_review',
        'scheduled',
        'in_progress',
        'awaiting_parts',
        'completed',
        'rejected',
        'cancelled'
      ),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'maintenance_updates',
    indexes: [
      { fields: ['request_id'] },
      { fields: ['created_by_id'] },
      { fields: ['created_at'] }
    ]
  });

  MaintenanceUpdate.associate = (models) => {
    MaintenanceUpdate.belongsTo(models.MaintenanceRequest, {
      foreignKey: 'requestId',
      as: 'request',
      onDelete: 'CASCADE'
    });

    MaintenanceUpdate.belongsTo(models.User, {
      foreignKey: 'createdById',
      as: 'createdBy',
      onDelete: 'SET NULL'
    });
  };

  return MaintenanceUpdate;
};
