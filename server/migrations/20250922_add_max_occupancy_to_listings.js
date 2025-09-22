'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add the maximum_occupancy column with a default value of 1
    await queryInterface.addColumn('listings', 'maximum_occupancy', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    // If you want to set a different default value for existing records, you can update them:
    await queryInterface.sequelize.query(
      'UPDATE listings SET maximum_occupancy = COALESCE(max_occupants, 1) WHERE maximum_occupancy IS NULL;'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('listings', 'maximum_occupancy');
  }
};
