const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conversation = sequelize.define('Conversation', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'conversations',
    indexes: [
      {
        fields: ['last_message_at']
      },
      {
        fields: ['is_group']
      }
    ]
  });

  // Define associations
  Conversation.associate = (models) => {
    // Conversation has many participants (Users)
    Conversation.belongsToMany(models.User, {
      through: 'conversation_participants',
      as: 'participants'
    });
    
    // Conversation has many messages
    Conversation.hasMany(models.Message, {
      foreignKey: 'conversationId',
      as: 'messages'
    });
    
    // Conversation can be associated with a listing
    Conversation.belongsTo(models.Listing, {
      foreignKey: 'listingId',
      as: 'listing'
    });
    
    // Conversation can be associated with a booking
    Conversation.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking'
    });
    
    // Last message in the conversation
    Conversation.belongsTo(models.Message, {
      foreignKey: 'lastMessageId',
      as: 'lastMessage'
    });
  };
  
  // Update last message timestamp and reference
  Conversation.updateLastMessage = async function(conversationId, message) {
    return await this.update(
      {
        lastMessageId: message.id,
        lastMessageAt: message.createdAt || new Date()
      },
      {
        where: { id: conversationId }
      }
    );
  };

  return Conversation;
};
