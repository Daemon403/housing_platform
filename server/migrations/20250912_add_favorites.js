'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorites', {
      id: { type: Sequelize.UUID, primaryKey: true, allowNull: false, defaultValue: Sequelize.literal('gen_random_uuid()') },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      listing_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'listings', key: 'id' }, onDelete: 'CASCADE' },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });
    // Idempotent indexes
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS favorites_user_id ON favorites (user_id)');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS favorites_listing_id ON favorites (listing_id)');
    await queryInterface.sequelize.query('CREATE UNIQUE INDEX IF NOT EXISTS uq_favorites_user_listing_idx ON favorites (user_id, listing_id)');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS uq_favorites_user_listing_idx');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS favorites_listing_id');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS favorites_user_id');
    await queryInterface.dropTable('favorites');
  }
};
