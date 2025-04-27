const Charity = require('../models/Charity');
const { Op } = require('sequelize');

// Fetch all approved charities
exports.getApprovedCharities = async () => {
  return await Charity.findAll({
    where: { status: 'approved' },
    attributes: [
      'id', 'name', 'email', 'phone', 'description',
      'mission', 'goals', 'projects',
      'street', 'apartment', 'zip', 'city', 'country'
    ],
    order: [['createdAt', 'DESC']]
  });
};

// Fetch filtered charities based on query parameters
exports.getFilteredCharities = async (filters) => {
  const whereClause = { status: 'approved' };

  if (filters.name) {
    whereClause.name = { [Op.like]: `%${filters.name}%` };
  }

  if (filters.city) {
    whereClause.city = { [Op.like]: `%${filters.city}%` };
  }

  return await Charity.findAll({
    where: whereClause,
    attributes: [
      'id', 'name', 'email', 'phone', 'description',
      'mission', 'goals', 'projects',
      'street', 'apartment', 'zip', 'city', 'country'
    ],
    order: [['createdAt', 'DESC']]
  });
};