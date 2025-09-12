/* eslint-disable */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // USERS
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      role: { type: Sequelize.ENUM('student', 'homeowner', 'admin'), defaultValue: 'student' },
      password: { type: Sequelize.STRING, allowNull: false },
      reset_password_token: { type: Sequelize.STRING },
      reset_password_expire: { type: Sequelize.DATE },
      is_verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      verification_token: { type: Sequelize.STRING },
      phone: { type: Sequelize.STRING },
      profile_image: { type: Sequelize.STRING },
      university: { type: Sequelize.STRING },
      student_id: { type: Sequelize.STRING, unique: true },
      address: { type: Sequelize.JSONB },
      preferences: { type: Sequelize.JSONB, defaultValue: {} },
      last_login: { type: Sequelize.DATE },
      status: { type: Sequelize.ENUM('active', 'suspended', 'banned'), defaultValue: 'active' },
      rating: { type: Sequelize.FLOAT, defaultValue: 0 },
      review_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    // LISTINGS
    await queryInterface.createTable('listings', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      owner_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING, allowNull: false },
      slug: { type: Sequelize.STRING, unique: true },
      description: { type: Sequelize.TEXT, allowNull: false },
      property_type: { type: Sequelize.ENUM('apartment', 'house', 'condo', 'townhouse', 'room', 'other'), allowNull: false },
      room_type: { type: Sequelize.ENUM('entire-place', 'private-room', 'shared-room'), allowNull: false },
      price: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      deposit: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      available_from: { type: Sequelize.DATE, allowNull: false },
      min_stay_months: { type: Sequelize.INTEGER, defaultValue: 1 },
      max_occupants: { type: Sequelize.INTEGER, allowNull: false },
      bedrooms: { type: Sequelize.INTEGER, allowNull: false },
      bathrooms: { type: Sequelize.DECIMAL(3, 1), allowNull: false },
      size: { type: Sequelize.INTEGER, allowNull: false },
      is_furnished: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_parking: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_wifi: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_kitchen: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_air_conditioning: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_heating: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_washer: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_tv: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_desk: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_pet_friendly: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_smoking_allowed: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_private_bathroom: { type: Sequelize.BOOLEAN, defaultValue: false },
      has_security_deposit: { type: Sequelize.BOOLEAN, defaultValue: true },
      utilities_included: { type: Sequelize.BOOLEAN, defaultValue: true },
      address: { type: Sequelize.JSONB, allowNull: false },
      location: { type: Sequelize.JSONB, allowNull: false },
      images: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      rules: { type: Sequelize.JSONB, defaultValue: {} },
      amenities: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      status: { type: Sequelize.ENUM('active', 'pending', 'rejected', 'sold', 'inactive'), defaultValue: 'pending' },
      featured: { type: Sequelize.BOOLEAN, defaultValue: false },
      view_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      rating: { type: Sequelize.FLOAT, defaultValue: 0 },
      review_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('listings', ['location']);
    await queryInterface.addIndex('listings', ['status']);
    await queryInterface.addIndex('listings', ['price']);
    await queryInterface.addIndex('listings', ['property_type']);
    await queryInterface.addIndex('listings', ['room_type']);

    // BOOKINGS
    await queryInterface.createTable('bookings', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      student_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      listing_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'listings', key: 'id' }, onDelete: 'CASCADE' },
      previous_booking_id: { type: Sequelize.UUID, references: { model: 'bookings', key: 'id' } },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      end_date: { type: Sequelize.DATEONLY, allowNull: false },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      deposit_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.ENUM('pending','approved','rejected','cancelled','active','completed','terminated'), defaultValue: 'pending' },
      payment_status: { type: Sequelize.ENUM('pending','partial','paid','refunded','partially_refunded','failed'), defaultValue: 'pending' },
      payment_method: { type: Sequelize.STRING },
      payment_id: { type: Sequelize.STRING },
      check_in_date: { type: Sequelize.DATE },
      check_out_date: { type: Sequelize.DATE },
      cancellation_reason: { type: Sequelize.TEXT },
      cancellation_date: { type: Sequelize.DATE },
      special_requests: { type: Sequelize.TEXT },
      terms_accepted: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      contract_signed: { type: Sequelize.BOOLEAN, defaultValue: false },
      contract_url: { type: Sequelize.STRING },
      contract_signed_at: { type: Sequelize.DATE },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['start_date']);
    await queryInterface.addIndex('bookings', ['end_date']);
    await queryInterface.addIndex('bookings', ['student_id']);
    await queryInterface.addIndex('bookings', ['listing_id']);

    // PAYMENTS
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      booking_id: { type: Sequelize.UUID, references: { model: 'bookings', key: 'id' }, onDelete: 'SET NULL' },
      listing_id: { type: Sequelize.UUID, references: { model: 'listings', key: 'id' }, onDelete: 'SET NULL' },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      payment_method: { type: Sequelize.STRING, allowNull: false },
      payment_provider: { type: Sequelize.ENUM('stripe','paystack','paypal','bank_transfer','mobile_money','other'), allowNull: false },
      payment_intent_id: { type: Sequelize.STRING },
      status: { type: Sequelize.ENUM('pending','requires_action','processing','succeeded','failed','canceled','refunded','partially_refunded','disputed','voided'), defaultValue: 'pending' },
      description: { type: Sequelize.TEXT },
      receipt_url: { type: Sequelize.STRING },
      failure_code: { type: Sequelize.STRING },
      failure_message: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      amount_refunded: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      refunded_at: { type: Sequelize.DATE },
      scheduled_for: { type: Sequelize.DATE },
      processed_at: { type: Sequelize.DATE },
      payment_method_details: { type: Sequelize.JSONB },
      application_fee: { type: Sequelize.DECIMAL(10, 2) },
      tax: { type: Sequelize.DECIMAL(10, 2) },
      source_type: { type: Sequelize.ENUM('card','bank_account','wallet','other') },
      source_id: { type: Sequelize.STRING },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('payments', ['status']);
    await queryInterface.addIndex('payments', ['user_id']);
    await queryInterface.addIndex('payments', ['booking_id']);
    await queryInterface.addIndex('payments', ['payment_intent_id']);
    await queryInterface.addIndex('payments', ['created_at']);
    await queryInterface.addIndex('payments', ['payment_provider']);

    // REFUNDS
    await queryInterface.createTable('refunds', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      payment_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'payments', key: 'id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'USD' },
      status: { type: Sequelize.ENUM('pending','processing','succeeded','failed','canceled'), defaultValue: 'pending' },
      reason: { type: Sequelize.STRING },
      processed_at: { type: Sequelize.DATE },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('refunds', ['status']);
    await queryInterface.addIndex('refunds', ['payment_id']);
    await queryInterface.addIndex('refunds', ['created_at']);

    // DISPUTES
    await queryInterface.createTable('disputes', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      payment_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'payments', key: 'id' }, onDelete: 'CASCADE' },
      opened_by_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      reason: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      status: { type: Sequelize.ENUM('open','under_review','resolved','rejected'), defaultValue: 'open' },
      resolved_at: { type: Sequelize.DATE },
      resolution_notes: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('disputes', ['status']);
    await queryInterface.addIndex('disputes', ['payment_id']);
    await queryInterface.addIndex('disputes', ['opened_by_id']);
    await queryInterface.addIndex('disputes', ['created_at']);

    // CONVERSATIONS (create without last_message_id FK to avoid cycle)
    await queryInterface.createTable('conversations', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      listing_id: { type: Sequelize.UUID, references: { model: 'listings', key: 'id' } },
      booking_id: { type: Sequelize.UUID, references: { model: 'bookings', key: 'id' } },
      last_message_id: { type: Sequelize.UUID },
      title: { type: Sequelize.STRING },
      last_message_at: { type: Sequelize.DATE },
      is_group: { type: Sequelize.BOOLEAN, defaultValue: false },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('conversations', ['last_message_at']);
    await queryInterface.addIndex('conversations', ['is_group']);

    // MESSAGES (references conversations)
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      sender_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      receiver_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      conversation_id: { type: Sequelize.UUID, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      listing_id: { type: Sequelize.UUID, references: { model: 'listings', key: 'id' }, onDelete: 'CASCADE' },
      booking_id: { type: Sequelize.UUID, references: { model: 'bookings', key: 'id' }, onDelete: 'CASCADE' },
      parent_message_id: { type: Sequelize.UUID, references: { model: 'messages', key: 'id' } },
      content: { type: Sequelize.TEXT, allowNull: false },
      is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
      read_at: { type: Sequelize.DATE },
      message_type: { type: Sequelize.ENUM('text','image','document','system'), defaultValue: 'text' },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('messages', ['sender_id']);
    await queryInterface.addIndex('messages', ['receiver_id']);
    await queryInterface.addIndex('messages', ['conversation_id']);
    await queryInterface.addIndex('messages', ['created_at']);
    await queryInterface.addIndex('messages', ['is_read']);
    await queryInterface.addIndex('messages', ['parent_message_id']);

    // Now add FK for conversations.last_message_id -> messages.id
    await queryInterface.addConstraint('conversations', {
      fields: ['last_message_id'],
      type: 'foreign key',
      name: 'fk_conversations_last_message_id',
      references: {
        table: 'messages',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    // MESSAGE ATTACHMENTS
    await queryInterface.createTable('message_attachments', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      message_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'messages', key: 'id' }, onDelete: 'CASCADE' },
      url: { type: Sequelize.STRING, allowNull: false },
      file_name: { type: Sequelize.STRING },
      mime_type: { type: Sequelize.STRING },
      size_bytes: { type: Sequelize.INTEGER },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('message_attachments', ['message_id']);
    await queryInterface.addIndex('message_attachments', ['created_at']);

    // MAINTENANCE REQUESTS
    await queryInterface.createTable('maintenance_requests', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      requester_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      assigned_to_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      listing_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'listings', key: 'id' }, onDelete: 'CASCADE' },
      booking_id: { type: Sequelize.UUID, references: { model: 'bookings', key: 'id' }, onDelete: 'SET NULL' },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      category: { type: Sequelize.ENUM('plumbing','electrical','appliance','heating_cooling','pest_control','furniture','security','cleaning','other'), allowNull: false },
      priority: { type: Sequelize.ENUM('low', 'medium', 'high', 'emergency'), defaultValue: 'medium' },
      status: { type: Sequelize.ENUM('submitted','in_review','scheduled','in_progress','awaiting_parts','completed','rejected','cancelled'), defaultValue: 'submitted' },
      preferred_date: { type: Sequelize.DATE },
      preferred_time: { type: Sequelize.STRING },
      scheduled_date: { type: Sequelize.DATE },
      completed_date: { type: Sequelize.DATE },
      images: { type: Sequelize.ARRAY(Sequelize.STRING), defaultValue: [] },
      cost_estimate: { type: Sequelize.DECIMAL(10, 2) },
      actual_cost: { type: Sequelize.DECIMAL(10, 2) },
      notes: { type: Sequelize.TEXT },
      resolution_notes: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('maintenance_requests', ['status']);
    await queryInterface.addIndex('maintenance_requests', ['priority']);
    await queryInterface.addIndex('maintenance_requests', ['category']);
    await queryInterface.addIndex('maintenance_requests', ['requester_id']);
    await queryInterface.addIndex('maintenance_requests', ['listing_id']);
    await queryInterface.addIndex('maintenance_requests', ['booking_id']);
    await queryInterface.addIndex('maintenance_requests', ['created_at']);

    // MAINTENANCE UPDATES
    await queryInterface.createTable('maintenance_updates', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      request_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'maintenance_requests', key: 'id' }, onDelete: 'CASCADE' },
      created_by_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      status: { type: Sequelize.ENUM('submitted','in_review','scheduled','in_progress','awaiting_parts','completed','rejected','cancelled'), allowNull: false },
      notes: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('maintenance_updates', ['request_id']);
    await queryInterface.addIndex('maintenance_updates', ['created_by_id']);
    await queryInterface.addIndex('maintenance_updates', ['created_at']);

    // REVIEWS
    await queryInterface.createTable('reviews', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
      reviewer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      reviewee_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      listing_id: { type: Sequelize.UUID, references: { model: 'listings', key: 'id' }, onDelete: 'CASCADE' },
      booking_id: { type: Sequelize.UUID, references: { model: 'bookings', key: 'id' }, onDelete: 'CASCADE' },
      rating: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING },
      comment: { type: Sequelize.TEXT, allowNull: false },
      response: { type: Sequelize.TEXT },
      response_date: { type: Sequelize.DATE },
      is_anonymous: { type: Sequelize.BOOLEAN, defaultValue: false },
      type: { type: Sequelize.ENUM('listing','user'), allowNull: false },
      status: { type: Sequelize.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
      metadata: { type: Sequelize.JSONB, defaultValue: {} },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addIndex('reviews', ['reviewer_id']);
    await queryInterface.addIndex('reviews', ['reviewee_id']);
    await queryInterface.addIndex('reviews', ['listing_id']);
    await queryInterface.addIndex('reviews', ['booking_id']);
    await queryInterface.addIndex('reviews', ['status']);
    await queryInterface.addIndex('reviews', ['type']);
    await queryInterface.addIndex('reviews', ['rating']);

    // CONVERSATION PARTICIPANTS (join table)
    await queryInterface.createTable('conversation_participants', {
      conversation_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'conversations', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    await queryInterface.addConstraint('conversation_participants', {
      fields: ['conversation_id', 'user_id'],
      type: 'primary key',
      name: 'pk_conversation_participants'
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order of dependencies
    await queryInterface.dropTable('conversation_participants');
    await queryInterface.dropTable('reviews');
    await queryInterface.dropTable('maintenance_updates');
    await queryInterface.dropTable('maintenance_requests');
    await queryInterface.dropTable('message_attachments');
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('disputes');
    await queryInterface.dropTable('refunds');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('listings');
    await queryInterface.dropTable('users');

    // Drop ENUMs
    const enumTables = [
      'users', 'listings', 'bookings', 'payments', 'disputes', 'messages', 'maintenance_requests', 'maintenance_updates', 'reviews'
    ];
    // Depending on the dialect, you may need to drop enums explicitly
    // This block is Postgres-specific safeguard
    if (queryInterface.sequelize.options.dialect === 'postgres') {
      const enums = [
        'enum_users_role',
        'enum_users_status',
        'enum_listings_property_type',
        'enum_listings_room_type',
        'enum_listings_status',
        'enum_bookings_status',
        'enum_bookings_payment_status',
        'enum_payments_payment_provider',
        'enum_payments_status',
        'enum_payments_source_type',
        'enum_disputes_status',
        'enum_messages_message_type',
        'enum_maintenance_requests_category',
        'enum_maintenance_requests_priority',
        'enum_maintenance_requests_status',
        'enum_maintenance_updates_status',
        'enum_reviews_type',
        'enum_reviews_status'
      ];
      for (const e of enums) {
        try { await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "${e}" CASCADE;`); } catch (err) {}
      }
    }
  }
};
