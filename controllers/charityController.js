const User = require('../models/user');
const Charity = require('../models/Charity');

// controllers/charityController.js
exports.registerCharity = async (req, res) => {
  const { name, email, phone, description, mission, goals, projects, street, apartment, zip, city, country } = req.body;
  try {
    const charity = await Charity.create({
      name,
      email,
      phone,
      description,
      mission,
      goals,
      projects,
      street,
      apartment,
      zip,
      city,
      country,
      createdBy: req.user.userId,
    });
    
  
      res.status(201).json({ message: 'Charity submitted for approval', charity });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to register charity' });
    }
  };
  
  // Get all charities created by the current user
  exports.getMyCharities = async (req, res) => {
    try {
      const charities = await Charity.findAll({
        where: { createdBy: req.user.userId },
        attributes: [
          'id', 'name', 'email', 'phone', 'description', 'status',
          'mission', 'goals', 'projects', 
          'street', 'apartment', 'zip', 'city', 'country'
        ],
              });
      res.status(200).json(charities);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch your charities' });
    }
  };
  
// Get a single charity by ID (must be created by current user)
exports.getCharityById = async (req, res) => {
  const { id } = req.params;

  try {
    const charity = await Charity.findOne({
      where: {
        id,
        createdBy: req.user.userId // so users can only access their own
      },
      attributes: [
        'id', 'name', 'email', 'phone', 'description', 'status',
        'mission', 'goals', 'projects',
        'street', 'apartment', 'zip', 'city', 'country'
      ]
    });

    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    res.status(200).json(charity);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching charity' });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, description, phone, mission, goals, projects } = req.body;

  try {
    const charity = await Charity.findOne({ where: { createdBy: req.user.userId } });

    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }

    // Update fields and set status to pending
    charity.name = name || charity.name;
    charity.description = description || charity.description;
    charity.phone = phone || charity.phone;
    charity.mission = mission || charity.mission;
    charity.goals = goals || charity.goals;
    charity.projects = projects || charity.projects;
    charity.status = 'pending';

    await charity.save();

    res.status(200).json({ message: 'Charity profile updated and status set to pending', charity });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};
