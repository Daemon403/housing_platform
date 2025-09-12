module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  }, {
    tableName: 'favorites',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['user_id', 'listing_id'] },
      { fields: ['user_id'] },
      { fields: ['listing_id'] }
    ]
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
    Favorite.belongsTo(models.Listing, { foreignKey: 'listingId', as: 'listing', onDelete: 'CASCADE' });
  };

  return Favorite;
};
