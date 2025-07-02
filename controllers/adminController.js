const Charity = require('../models/Charity');

  // For Admin: Get all unapproved charities
  exports.getPendingCharities = async (req, res) => {
    try {
      const pending = await Charity.findAll({
        where: {status : 'pending'},
        attributes: ['id', 'name', 'email', 'phone', 'description', 'status', 'mission', 'goals', 'projects'], // optional but clean
      });
  
      res.status(200).json(pending);
    } catch (err) {
      console.error('❌ Error in getPendingCharities:', err);
      res.status(500).json({ error: 'Error fetching pending charities' });
    }
  };
  
  
  exports.updateCharityStatus = async (req, res) => {
    const charityId = req.params.id;
    const { status } = req.body;
  
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
  
    try {
      const charity = await Charity.findByPk(charityId);
      if (!charity) return res.status(404).json({ error: 'Charity not found' });
  
      charity.status = status;
      await charity.save();
  
      res.status(200).json({ message: `Charity ${status} successfully` });
    } catch (err) {
      res.status(500).json({ error: 'Status update failed' });
    }
  };