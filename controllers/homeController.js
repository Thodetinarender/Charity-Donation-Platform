const charityService = require('../services/homeService');

// Get all approved charities
exports.getApprovedCharities = async (req, res) => {
  try {
    const approvedCharities = await charityService.getApprovedCharities();
    res.status(200).json(approvedCharities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch approved charities' });
  }
};

// Filter charities by name, city, category
exports.getFilteredCharities = async (req, res) => {
  try {
    const filters = req.query;
    const filteredCharities = await charityService.getFilteredCharities(filters);
    res.status(200).json(filteredCharities);
  } catch (err) {
    console.error('Error fetching filtered charities:', err);
    res.status(500).json({ error: 'Failed to fetch filtered charities' });
  }
};