const { Op, Sequelize } = require('sequelize');
const db = require('../models');

// Haversine distance between 2 lat/lng points in kilometers
function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function listListings(params = {}) {
  const {
    page = 1,
    pageSize = 20,
    minPrice,
    maxPrice,
    propertyType,
    roomType,
    status,
    q,
    sort = 'createdAt',
    order = 'DESC',
    lat,
    lng,
    radiusKm
  } = params;

  const where = {};

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  if (propertyType) where.propertyType = propertyType;
  if (roomType) where.roomType = roomType;
  if (status) where.status = status;

  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } }
    ];
  }

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { rows, count } = await db.Listing.findAndCountAll({
    where,
    offset,
    limit,
    order: [[sort, order]],
  });

  // Optional radius filter (post-filter for simplicity; consider PostGIS later for scale)
  let filteredRows = rows;
  if (
    lat != null &&
    lng != null &&
    radiusKm != null
  ) {
    filteredRows = rows.filter((l) => {
      const loc = l.location || {};
      if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      const d = haversineKm(Number(lat), Number(lng), loc.lat, loc.lng);
      return d <= Number(radiusKm);
    });
  }

  return {
    data: filteredRows,
    pagination: {
      page: Number(page),
      pageSize: Number(pageSize),
      total: count,
      totalPages: Math.ceil(count / Number(pageSize))
    }
  };
}

async function createListing(payload, ownerId) {
  const listing = await db.Listing.create({ ...payload, ownerId });
  return listing;
}

async function getListingById(id) {
  const listing = await db.Listing.findByPk(id);
  return listing;
}

async function updateListing(id, payload) {
  const listing = await db.Listing.findByPk(id);
  if (!listing) return null;
  await listing.update(payload);
  return listing;
}

async function deleteListing(id) {
  const listing = await db.Listing.findByPk(id);
  if (!listing) return 0;
  await listing.destroy();
  return 1;
}

module.exports = {
  listListings,
  createListing,
  getListingById,
  updateListing,
  deleteListing,
};
