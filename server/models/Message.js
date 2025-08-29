const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    messageType: {
      type: DataTypes.ENUM(
        'text',
        'image',
        'document',
        'system'
      ),
      defaultValue: 'text'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    // For message threading/replies
    parentMessageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'messages',
        key: 'id'
      }
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'messages',
    indexes: [
      {
        fields: ['sender_id']
      },
      {
        fields: ['receiver_id']
      },
      {
        fields: ['conversation_id']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['is_read']
      },
      {
        fields: ['parent_message_id']
      }
    ]
  });

  // Define associations
  Message.associate = (models) => {
    // Message belongs to a sender (User)
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
      onDelete: 'CASCADE'
    });
    
    // Message belongs to a receiver (User)
    Message.belongsTo(models.User, {
      foreignKey: 'receiverId',
      as: 'receiver',
      onDelete: 'CASCADE'
    });
    
    // Message can belong to a conversation
    Message.belongsTo(models.Conversation, {
      foreignKey: 'conversationId',
      as: 'conversation',
      onDelete: 'CASCADE'
    });
    
    // Message can have attachments
    Message.hasMany(models.MessageAttachment, {
      foreignKey: 'messageId',
      as: 'attachments'
    });
    
    // For threaded messages
    Message.belongsTo(models.Message, {
      foreignKey: 'parentMessageId',
      as: 'parentMessage'
    });
    
    Message.hasMany(models.Message, {
      foreignKey: 'parentMessageId',
      as: 'replies'
    });
    
    // Message can be associated with a listing
    Message.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing',
      onDelete: 'CASCADE'
    });
    
    // Message can be associated with a booking
    Message.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking',
      onDelete: 'CASCADE'
    });
  };
  
  // Mark message as read
  Message.prototype.markAsRead = async function() {
    if (!this.isRead) {
      this.isRead = true;
      this.readAt = new Date();
      await this.save();
    }
  };

  return Message;
};
