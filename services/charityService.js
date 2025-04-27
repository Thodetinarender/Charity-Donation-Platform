const Charity = require('../models/Charity');

// Register a new charity
exports.registerCharity = async (charityData, userId) => {
  return await Charity.create({
    ...charityData,
    createdBy: userId,
  });
};

// Get all charities created by the current user
exports.getMyCharities = async (userId) => {
  return await Charity.findAll({
    where: { createdBy: userId },
    attributes: [
      'id', 'name', 'email', 'phone', 'description', 'status',
      'mission', 'goals', 'projects',
      'street', 'apartment', 'zip', 'city', 'country',
    ],
  });
};

// Get a single charity by ID (must be created by the current user)
exports.getCharityById = async (id, userId) => {
  return await Charity.findOne({
    where: { id, createdBy: userId },
    attributes: [
      'id', 'name', 'email', 'phone', 'description', 'status',
      'mission', 'goals', 'projects',
      'street', 'apartment', 'zip', 'city', 'country',
    ],
  });
};

// Update charity profile
exports.updateCharityProfile = async (userId, profileData) => {
  const { id } = profileData; // Ensure the charity ID is passed

  if (!id) {
    throw new Error('Charity ID is required for updating the profile');
  }

  const charity = await Charity.findOne({ where: { id, createdBy: userId } });

  if (!charity) {
    throw new Error('Charity not found or you do not have permission to update it');
  }

  // Update only allowed fields
  const allowedFields = ['name', 'description', 'phone', 'mission', 'goals', 'projects', 'street', 'apartment', 'zip', 'city', 'country'];
  allowedFields.forEach(field => {
    if (profileData[field] !== undefined) {
      charity[field] = profileData[field];
    }
  });

  charity.status = 'pending'; // Always set to pending
  await charity.save();

  return charity;
};