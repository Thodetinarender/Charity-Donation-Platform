const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');
const Charity = require('../models/Charity');
const PDFDocument = require('pdfkit');
const brevoEmail = require('../config/email');

// Create a Stripe donation session
exports.createDonationSession = async (amount, charityId, userId, userEmail) => {
  const donation = await Donation.create({
    amount: parseFloat(amount),
    charityId: parseInt(charityId),
    userId: parseInt(userId),
    stripePaymentId: null,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Donation to Charity ID: ${charityId}` },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        userId: String(userId),
        charityId: String(charityId),
        amount: String(amount),
        donationId: String(donation.id),
        email: userEmail,
      },
    },
    success_url: `${process.env.BASE_URL}/html/success.html?session_id={CHECKOUT_SESSION_ID}&donation_id=${donation.id}`,
    cancel_url: `${process.env.BASE_URL}/html/cancel.html`,
  });

  return { sessionUrl: session.url, donation };
};

// Confirm a donation and send a confirmation email
exports.confirmDonation = async (sessionId, donationId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntentId = session.payment_intent;
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed');
  }

  const metadata = paymentIntent.metadata;
  const donation = await Donation.findByPk(donationId);
  if (!donation) throw new Error('Donation not found');

  donation.UserId = parseInt(metadata.userId);
  donation.CharityId = parseInt(metadata.charityId);
  donation.stripePaymentId = paymentIntentId;
  await donation.save();

  const charity = await Charity.findByPk(donation.CharityId);
  if (!charity) throw new Error('Charity not found');

  const sendSmtpEmail = {
    to: [{ email: metadata.email }],
    sender: { name: 'Charity Donation', email: process.env.BREVO_SENDER_EMAIL },
    subject: `Your donation to ${charity.name} was successful!`,
    htmlContent: `
      <h2>Thank You!</h2>
      <p>Your donation of <strong>$${donation.amount.toFixed(2)}</strong> to <strong>${charity.name}</strong> has been received.</p>
      <p>Receipt ID: ${donation.id}<br>Payment ID: ${donation.stripePaymentId || 'N/A'}</p>
    `,
  };

  await brevoEmail.sendTransacEmail(sendSmtpEmail);

  return donation;
};

// Get donation history for a user
exports.getDonationHistory = async (userId) => {
  return await Donation.findAll({
    where: { UserId: userId },
    include: { model: Charity, attributes: ['name', 'email'] },
    order: [['createdAt', 'DESC']],
  });
};

// Generate a donation receipt as a PDF
exports.generateDonationReceipt = async (userId, donationId, res) => {
  const donation = await Donation.findOne({
    where: { id: donationId, UserId: userId },
    include: { model: Charity, attributes: ['name', 'email'] },
  });

  if (!donation) throw new Error('Donation not found');

  const doc = new PDFDocument();
  res.setHeader('Content-Disposition', `attachment; filename=donation_receipt_${donation.id}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Charity Donation Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Receipt ID: ${donation.id}`);
  doc.text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`);
  doc.text(`Charity: ${donation.Charity.name}`);
  doc.text(`Charity Email: ${donation.Charity.email}`);
  doc.text(`Amount Donated: $${donation.amount.toFixed(2)}`);
  doc.text(`Payment ID: ${donation.stripePaymentId || 'N/A'}`);
  doc.moveDown();
  doc.text('Thank you for your generous contribution!', { align: 'center' });
  doc.end();
};

// Generate all donation receipts as a PDF
exports.generateAllReceipts = async (userId, res) => {
  const donations = await Donation.findAll({
    where: { UserId: userId },
    include: { model: Charity, attributes: ['name', 'email'] },
    order: [['createdAt', 'DESC']],
  });

  if (!donations || donations.length === 0) throw new Error('No donations found');

  const doc = new PDFDocument();
  res.setHeader('Content-Disposition', `attachment; filename=all_donations_${userId}.pdf`);
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  doc.fontSize(20).text('Donation History Receipt', { align: 'center' });
  doc.moveDown();

  donations.forEach((donation, index) => {
    doc.fontSize(14).text(`Donation #${index + 1}`);
    doc.fontSize(12).text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`);
    doc.text(`Charity: ${donation.Charity.name}`);
    doc.text(`Charity Email: ${donation.Charity.email}`);
    doc.text(`Amount: $${donation.amount.toFixed(2)}`);
    doc.text(`Payment ID: ${donation.stripePaymentId || 'N/A'}`);
    doc.moveDown().moveDown();
  });

  doc.text('Thank you for all your generous contributions!', { align: 'center' });
  doc.end();
};