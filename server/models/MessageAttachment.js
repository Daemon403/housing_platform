const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MessageAttachment = sequelize.define('MessageAttachment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'message_attachments',
    indexes: [
      { fields: ['message_id'] },
      { fields: ['created_at'] }
    ]
  });

  MessageAttachment.associate = (models) => {
    MessageAttachment.belongsTo(models.Message, {
      foreignKey: 'messageId',
      as: 'message',
      onDelete: 'CASCADE'
    });
  };

  return MessageAttachment;
};
