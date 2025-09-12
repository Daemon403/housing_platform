const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Import models
const models = {
  User: require('./User')(sequelize, Sequelize.DataTypes),
  Listing: require('./Listing')(sequelize, Sequelize.DataTypes),
  Booking: require('./Booking')(sequelize, Sequelize.DataTypes),
  Payment: require('./Payment')(sequelize, Sequelize.DataTypes),
  Review: require('./Review')(sequelize, Sequelize.DataTypes),
  Conversation: require('./Conversation')(sequelize, Sequelize.DataTypes),
  Message: require('./Message')(sequelize, Sequelize.DataTypes),
  MaintenanceRequest: require('./MaintenanceRequest')(sequelize, Sequelize.DataTypes),
  // Additional models referenced by associations
  Refund: require('./Refund')(sequelize, Sequelize.DataTypes),
  Dispute: require('./Dispute')(sequelize, Sequelize.DataTypes),
  MessageAttachment: require('./MessageAttachment')(sequelize, Sequelize.DataTypes),
  MaintenanceUpdate: require('./MaintenanceUpdate')(sequelize, Sequelize.DataTypes),
  Favorite: require('./Favorite')(sequelize, Sequelize.DataTypes)
};

// Initialize models
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
  db[modelName] = models[modelName];
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

