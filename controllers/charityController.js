const charityService = require('../services/charityService');

// Register a new charity
exports.registerCharity = async (req, res) => {
  const charityData = req.body;
  const userId = req.user.userId;

  try {
    const charity = await charityService.registerCharity(charityData, userId);
    res.status(201).json({ message: 'Charity submitted for approval', charity });
  } catch (err) {
    console.error('❌ Error in registerCharity:', err);
    res.status(500).json({ error: 'Failed to register charity' });
  }
};

// Get all charities created by the current user
exports.getMyCharities = async (req, res) => {
  const userId = req.user.userId;

  try {
    const charities = await charityService.getMyCharities(userId);
    res.status(200).json(charities);
  } catch (err) {
    console.error('❌ Error in getMyCharities:', err);
    res.status(500).json({ error: 'Failed to fetch your charities' });
  }
};

// Get a single charity by ID (must be created by the current user)
exports.getCharityById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const charity = await charityService.getCharityById(id, userId);

    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    res.status(200).json(charity);
  } catch (err) {
    console.error('❌ Error in getCharityById:', err);
    res.status(500).json({ error: 'Error fetching charity' });
  }
};

// Update charity profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const profileData = req.body;

  try {
    const charity = await charityService.updateCharityProfile(userId, profileData);
    res.status(200).json({ message: 'Charity profile updated and status set to pending', charity });
  } catch (err) {
    console.error('❌ Error in updateProfile:', err.message);
    res.status(500).json({ error: 'Update failed', details: err.message });
  }
};