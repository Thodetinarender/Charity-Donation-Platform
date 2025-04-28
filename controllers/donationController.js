const donationService = require('../services/donationService');

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

exports.confirmDonation = async (req, res) => {
  try {
    const { sessionId, donationId } = req.body;
    const donation = await donationService.confirmDonation(sessionId, donationId);
    res.status(200).json(donation);
  } catch (err) {
    console.error('❌ Error in confirmDonation:', err.message);
    res.status(500).json({ error: 'Failed to confirm donation' });
  }
};

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


exports.downloadDonationReceipt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const donationId = req.params.donationId;
    const pdfData = await donationService.generateDonationReceipt(userId, donationId);

    res.setHeader('Content-Disposition', `attachment; filename=donation_receipt_${donationId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  } catch (err) {
    console.error('❌ Error in downloadDonationReceipt:', err.message);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
};

exports.downloadAllReceipts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const pdfData = await donationService.generateAllReceipts(userId);

    res.setHeader('Content-Disposition', `attachment; filename=all_donations_${userId}.pdf`);
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfData);
  } catch (err) {
    console.error('❌ Error in downloadAllReceipts:', err.message);
    res.status(500).json({ error: 'Failed to generate receipts' });
  }
};
