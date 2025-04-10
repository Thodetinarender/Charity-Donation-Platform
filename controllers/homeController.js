// controllers/homeController.js
const Charity = require('../models/Charity');
const { Op } = require('sequelize');

// Get all approved charities
exports.getApprovedCharities = async (req, res) => {
  try {
    const approvedCharities = await Charity.findAll({
      where: { status: 'approved' },
      attributes: [
        'id', 'name', 'email', 'phone', 'description',
        'mission', 'goals', 'projects', 
        'street', 'apartment', 'zip', 'city', 'country'
      ],
      order: [['createdAt', 'DESC']] // optional: shows most recent first
    });

    res.status(200).json(approvedCharities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch approved charities' });
  }
};


// Filter charities by name, city, category
exports.getFilteredCharities = async (req, res) => {
    try {
      const { name, city } = req.query;
  
      const whereClause = {
        status: 'approved'
      };
  
      if (name) {
        whereClause.name = { [Op.like]: `%${name}%` }; // ✅ MySQL-friendly
      }
  
      if (city) {
        whereClause.city = { [Op.like]: `%${city}%` }; // ✅ MySQL-friendly
      }
  
      const filteredCharities = await Charity.findAll({
        where: whereClause,
        attributes: [
          'id', 'name', 'email', 'phone', 'description',
          'mission', 'goals', 'projects',
          'street', 'apartment', 'zip', 'city', 'country',
        ],
        order: [['createdAt', 'DESC']]
      });
  
      res.status(200).json(filteredCharities);
    } catch (err) {
      console.error('Error fetching filtered charities:', err);
      res.status(500).json({ error: 'Failed to fetch filtered charities' });
    }
  };
  