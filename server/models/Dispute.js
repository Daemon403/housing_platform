const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Dispute = sequelize.define('Dispute', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('open', 'under_review', 'resolved', 'rejected'),
      defaultValue: 'open'
    },
    resolvedAt: {
      type: DataTypes.DATE,
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
    tableName: 'disputes',
    indexes: [
      { fields: ['status'] },
      { fields: ['payment_id'] },
      { fields: ['opened_by_id'] },
      { fields: ['created_at'] }
    ]
  });

  Dispute.associate = (models) => {
    Dispute.belongsTo(models.Payment, {
      foreignKey: 'paymentId',
      as: 'payment',
      onDelete: 'CASCADE'
    });

    Dispute.belongsTo(models.User, {
      foreignKey: 'openedById',
      as: 'openedBy',
      onDelete: 'SET NULL'
    });
  };

  return Dispute;
};
