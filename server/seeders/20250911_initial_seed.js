'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Use models for proper JSONB handling and hooks
    const db = require('../models');

    // Users (idempotent)
    const [alice] = await db.User.findOrCreate({
      where: { email: 'alice@student.edu' },
      defaults: {
        id: uuidv4(),
        name: 'Alice Student',
        role: 'student',
        password: 'Password123!', // will be hashed by model hook
        isVerified: true,
        createdAt: now,
        updatedAt: now
      }
    });

    const [bob] = await db.User.findOrCreate({
      where: { email: 'bob@owner.com' },
      defaults: {
        id: uuidv4(),
        name: 'Bob Homeowner',
        role: 'homeowner',
        password: 'Password123!',
        isVerified: true,
        createdAt: now,
        updatedAt: now
      }
    });

    // Listings (idempotent by slug)
    const [l1] = await db.Listing.findOrCreate({
      where: { slug: 'cozy-private-room-near-campus-1' },
      defaults: {
        id: uuidv4(),
        ownerId: bob.id,
        title: 'Cozy Private Room near Campus',
        description: 'Bright private room, shared kitchen, 10 mins to campus.',
        propertyType: 'room',
        roomType: 'private-room',
        price: 500.0,
        deposit: 200.0,
        availableFrom: now,
        minStayMonths: 3,
        maxOccupants: 1,
        bedrooms: 1,
        bathrooms: 1.0,
        size: 15,
        isFurnished: true,
        hasWifi: true,
        address: { street: '123 College St', city: 'Uni City', state: 'CA', postalCode: '90001', country: 'USA' },
        location: { lat: 34.0522, lng: -118.2437 },
        images: [],
        amenities: ['wifi', 'desk'],
        status: 'active',
      }
    });

    const [l2] = await db.Listing.findOrCreate({
      where: { slug: 'entire-apartment-downtown-1' },
      defaults: {
        id: uuidv4(),
        ownerId: bob.id,
        title: 'Entire Apartment Downtown',
        description: '2 bed apartment, great views.',
        propertyType: 'apartment',
        roomType: 'entire-place',
        price: 1800.0,
        deposit: 500.0,
        availableFrom: now,
        minStayMonths: 6,
        maxOccupants: 3,
        bedrooms: 2,
        bathrooms: 1.5,
        size: 70,
        isFurnished: false,
        hasParking: true,
        address: { street: '500 Main St', city: 'Uni City', state: 'CA', postalCode: '90002', country: 'USA' },
        location: { lat: 34.05, lng: -118.25 },
        images: [],
        amenities: ['parking'],
        status: 'active',
      }
    });

    // Conversation
    const [conv] = await db.Conversation.findOrCreate({
      where: { title: 'Inquiry about Cozy Room' },
      defaults: {
        id: uuidv4(),
        listingId: l1.id,
        isGroup: false,
      }
    });

    // Participants (through raw join table since it's simple)
    await queryInterface.bulkInsert('conversation_participants', [
      { conversation_id: conv.id, user_id: alice.id, created_at: now, updated_at: now },
      { conversation_id: conv.id, user_id: bob.id, created_at: now, updated_at: now },
    ], { ignoreDuplicates: true });

    // Message
    await db.Message.findOrCreate({
      where: { content: 'Hi! Is the room still available next month?' },
      defaults: {
        id: uuidv4(),
        conversationId: conv.id,
        senderId: alice.id,
        receiverId: bob.id,
        content: 'Hi! Is the room still available next month?',
        isRead: false,
        messageType: 'text',
      }
    });
  },

  async down(queryInterface, Sequelize) {
    const db = require('../models');
    await db.Message.destroy({ where: {} });
    await queryInterface.bulkDelete('conversation_participants', null, {});
    await db.Conversation.destroy({ where: {} });
    await db.Listing.destroy({ where: {} });
    await db.User.destroy({ where: {} });
  }
};
