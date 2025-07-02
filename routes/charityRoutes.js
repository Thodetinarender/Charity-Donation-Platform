const express = require('express');
const router = express.Router();
const charityController = require('../controllers/charityController');
const authenticateUser = require('../middlewares/authMiddleware');

// Route to register a new charity (requires authentication)
router.post('/', authenticateUser, charityController.registerCharity);

router.get('/mine', authenticateUser, charityController.getMyCharities);

router.get('/:id', authenticateUser, charityController.getCharityById);

// Route for an approved charity to update their profile
router.put('/profile/update', authenticateUser, charityController.updateProfile);

module.exports = router;
