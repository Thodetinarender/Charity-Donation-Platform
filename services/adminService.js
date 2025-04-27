const Charity = require('../models/Charity');

// Fetch all pending charities
exports.getPendingCharities = async () => {
  return await Charity.findAll({
    where: { status: 'pending' },
    attributes: ['id', 'name', 'email', 'phone', 'description', 'status', 'mission', 'goals', 'projects'],
  });
};

// Update charity status
exports.updateCharityStatus = async (charityId, status) => {
  const charity = await Charity.findByPk(charityId);
  if (!charity) {
    throw new Error('Charity not found');
  }

  charity.status = status;
  await charity.save();
  return charity;
};