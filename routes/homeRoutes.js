// routes/homeRoutes.js
const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const authenticateUser = require('../middlewares/authMiddleware');

// GET approved charities
router.get('/charities/approved', authenticateUser, homeController.getApprovedCharities);


// ✅ NEW: GET charities with filters
router.get('/charities/search', authenticateUser, homeController.getFilteredCharities);

module.exports = router;
