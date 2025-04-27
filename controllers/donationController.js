const donationService = require('../services/donationService');

// Create a Stripe donation session
exports.createDonationSession = async (req, res) => {
  try {
    const { amount, charityId } = req.body;
    const userId = req.user.userId;
    const userEmail = req.user.email;

    const { sessionUrl } = await donationService.createDonationSession(amount, charityId, userId, userEmail);
    res.status(200).json({ url: sessionUrl });
  } catch (err) {
    console.error('❌ Error in createDonationSession:', err.message);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
};

// Confirm a donation
exports.confirmDonation = async (req, res) => {
  try {
    const { sessionId, donationId } = req.body;
    const donation = await donationService.confirmDonation(sessionId, donationId);
    res.status(200).json({ message: 'Donation saved and email sent', donation });
  } catch (err) {
    console.error('❌ Error in confirmDonation:', err.message);
    res.status(500).json({ error: 'Failed to confirm donation' });
  }
};

// Get donation history
exports.getDonationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const donations = await donationService.getDonationHistory(userId);
    res.status(200).json(donations);
  } catch (err) {
    console.error('❌ Error in getDonationHistory:', err.message);
    res.status(500).json({ error: 'Failed to fetch donation history' });
  }
};

// Download donation receipt
exports.downloadDonationReceipt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const donationId = req.params.donationId;
    await donationService.generateDonationReceipt(userId, donationId, res);
  } catch (err) {
    console.error('❌ Error in downloadDonationReceipt:', err.message);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
};

// Download all donation receipts
exports.downloadAllReceipts = async (req, res) => {
  try {
    const userId = req.user.userId;
    await donationService.generateAllReceipts(userId, res);
  } catch (err) {
    console.error('❌ Error in downloadAllReceipts:', err.message);
    res.status(500).json({ error: 'Failed to generate receipts' });
  }
};