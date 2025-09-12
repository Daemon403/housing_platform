'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    // Users
    const users = [
      {
        id: uuidv4(),
        name: 'Alice Student',
        email: 'alice@student.edu',
        role: 'student',
        password: '$2a$10$CUMULATIVEHASHPLACEHOLDER', // replace or login flow will overwrite on create; here unused
        is_verified: true,
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        name: 'Bob Homeowner',
        email: 'bob@owner.com',
        role: 'homeowner',
        password: '$2a$10$CUMULATIVEHASHPLACEHOLDER',
        is_verified: true,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('users', users);

    const ownerId = users[1].id;

    // Listings
    const listings = [
      {
        id: uuidv4(),
        owner_id: ownerId,
        title: 'Cozy Private Room near Campus',
        slug: 'cozy-private-room-near-campus-1',
        description: 'Bright private room, shared kitchen, 10 mins to campus.',
        property_type: 'room',
        room_type: 'private-room',
        price: 500.00,
        deposit: 200.00,
        available_from: now,
        min_stay_months: 3,
        max_occupants: 1,
        bedrooms: 1,
        bathrooms: 1.0,
        size: 15,
        is_furnished: true,
        has_wifi: true,
        address: { street: '123 College St', city: 'Uni City', state: 'CA', postalCode: '90001', country: 'USA' },
        location: { lat: 34.0522, lng: -118.2437 },
        images: [],
        amenities: ['wifi', 'desk'],
        status: 'active',
        created_at: now,
        updated_at: now
      },
      {
        id: uuidv4(),
        owner_id: ownerId,
        title: 'Entire Apartment Downtown',
        slug: 'entire-apartment-downtown-1',
        description: '2 bed apartment, great views.',
        property_type: 'apartment',
        room_type: 'entire-place',
        price: 1800.00,
        deposit: 500.00,
        available_from: now,
        min_stay_months: 6,
        max_occupants: 3,
        bedrooms: 2,
        bathrooms: 1.5,
        size: 70,
        is_furnished: false,
        has_parking: true,
        address: { street: '500 Main St', city: 'Uni City', state: 'CA', postalCode: '90002', country: 'USA' },
        location: { lat: 34.05, lng: -118.25 },
        images: [],
        amenities: ['parking'],
        status: 'active',
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('listings', listings);

    // Conversations
    const conversations = [
      {
        id: uuidv4(),
        listing_id: listings[0].id,
        title: 'Inquiry about Cozy Room',
        is_group: false,
        created_at: now,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('conversations', conversations);

    // Participants
    const participants = [
      {
        conversation_id: conversations[0].id,
        user_id: users[0].id, // Alice
        created_at: now,
        updated_at: now
      },
      {
        conversation_id: conversations[0].id,
        user_id: ownerId, // Bob
        created_at: now,
        updated_at: now
      }
    ];
    await queryInterface.bulkInsert('conversation_participants', participants);

    // Messages
    const messages = [
      {
        id: uuidv4(),
        conversation_id: conversations[0].id,
        sender_id: users[0].id,
        receiver_id: ownerId,
        content: 'Hi! Is the room still available next month?',
        is_read: false,
        message_type: 'text',
        created_at: now,
        updated_at: now
      }
    ];
    await queryInterface.bulkInsert('messages', messages);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('messages', null, {});
    await queryInterface.bulkDelete('conversation_participants', null, {});
    await queryInterface.bulkDelete('conversations', null, {});
    await queryInterface.bulkDelete('listings', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
