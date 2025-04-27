const adminService = require('../services/adminService');

// For Admin: Get all unapproved charities
exports.getPendingCharities = async (req, res) => {
  try {
    const pendingCharities = await adminService.getPendingCharities();
    res.status(200).json(pendingCharities);
  } catch (err) {
    console.error('❌ Error in getPendingCharities:', err);
    res.status(500).json({ error: 'Error fetching pending charities' });
  }
};

// Update charity status
exports.updateCharityStatus = async (req, res) => {
  const charityId = req.params.id;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updatedCharity = await adminService.updateCharityStatus(charityId, status);
    res.status(200).json({ message: `Charity ${status} successfully`, charity: updatedCharity });
  } catch (err) {
    console.error('❌ Error in updateCharityStatus:', err);
    res.status(500).json({ error: 'Status update failed' });
  }
};