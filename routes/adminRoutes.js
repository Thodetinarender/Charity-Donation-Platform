const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateUser = require('../middlewares/authMiddleware');
const isAdmin = require('../middlewares/isAdminOnly');


// Route for admin to get all pending (unapproved) charities
router.get('/pending', authenticateUser, isAdmin, adminController.getPendingCharities);

// Route for admin to approve a charity
router.patch('/:id/status', authenticateUser, isAdmin, adminController.updateCharityStatus);

module.exports = router;
