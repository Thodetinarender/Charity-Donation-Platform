// routes/donationRoutes.js
const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const authenticateUser = require('../middlewares/authMiddleware');
const bodyParser = require('body-parser');


// Create a Stripe session
router.post('/create-session', authenticateUser, donationController.createDonationSession);

router.post('/confirm', authenticateUser, donationController.confirmDonation);

router.get('/history', authenticateUser, donationController.getDonationHistory);

router.get('/:donationId/receipt', authenticateUser, donationController.downloadDonationReceipt);

router.get('/receipt/all', authenticateUser, donationController.downloadAllReceipts);




module.exports = router;
