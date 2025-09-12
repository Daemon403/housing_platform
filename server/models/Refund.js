const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Refund = sequelize.define('Refund', {
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
    status: {
      type: DataTypes.ENUM(
        'pending',
        'processing',
        'succeeded',
        'failed',
        'canceled'
      ),
      defaultValue: 'pending'
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    processedAt: {
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
    tableName: 'refunds',
    indexes: [
      { fields: ['status'] },
      { fields: ['payment_id'] },
      { fields: ['created_at'] }
    ]
  });

  Refund.associate = (models) => {
    Refund.belongsTo(models.Payment, {
      foreignKey: 'paymentId',
      as: 'payment',
      onDelete: 'CASCADE'
    });
  };

  return Refund;
};
