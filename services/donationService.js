const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const PDFDocument = require('pdfkit');
const Donation = require('../models/Donation');
const Charity = require('../models/Charity');
const brevoEmail = require('../config/email'); // Brevo instance

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
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: { name: `Donation to Charity ID: ${charityId}` },
        unit_amount: Math.round(amount * 100),
      },
      quantity: 1,
    }],
    payment_intent_data: {
      metadata: {
        userId: String(userId),
        charityId: String(charityId),
        amount: String(amount),
        donationId: String(donation.id),
        email: userEmail
      }
    },
    success_url: `${process.env.BASE_URL}/html/success.html?session_id={CHECKOUT_SESSION_ID}&donation_id=${donation.id}`,
    cancel_url: `${process.env.BASE_URL}/html/cancel.html`,
  });

  return { sessionUrl: session.url };
};

exports.confirmDonation = async (sessionId, donationId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

  if (session.payment_status !== 'paid') {
    throw new Error('Payment not completed');
  }

  const metadata = paymentIntent.metadata;
  const donation = await Donation.findByPk(donationId);
  if (!donation) throw new Error('Donation not found');

  donation.UserId = parseInt(metadata.userId);
  donation.CharityId = parseInt(metadata.charityId);
  donation.stripePaymentId = paymentIntent.id;
  await donation.save();

  const charity = await Charity.findByPk(donation.CharityId);
  if (!charity) throw new Error('Charity not found');

  await sendConfirmationEmail(metadata.email, charity.name, donation);

  return { message: 'Donation saved and email sent', donation };
};

const sendConfirmationEmail = async (userEmail, charityName, donation) => {
  const sendSmtpEmail = {
    to: [{ email: userEmail }],
    sender: {
      name: 'Charity Donation',
      email: process.env.BREVO_SENDER_EMAIL
    },
    subject: `Your donation to ${charityName} was successful!`,
    htmlContent: `
      <h2>Thank You!</h2>
      <p>Your donation of <strong>$${donation.amount.toFixed(2)}</strong> to <strong>${charityName}</strong> has been received.</p>
      <p>Receipt ID: ${donation.id}<br>Payment ID: ${donation.stripePaymentId || 'N/A'}</p>
    `
  };

  await brevoEmail.sendTransacEmail(sendSmtpEmail);
};

exports.getDonationHistory = async (userId) => {
  return await Donation.findAll({
    where: { UserId: userId },
    include: {
      model: Charity,
      attributes: ['name', 'email']
    },
    order: [['createdAt', 'DESC']]
  });
};

exports.generateDonationReceipt = async (userId, donationId) => {
  const donation = await Donation.findOne({
    where: { id: donationId, UserId: userId },
    include: {
      model: Charity,
      attributes: ['name', 'email']
    }
  });

  if (!donation) {
    throw new Error('Donation not found');
  }

  const doc = new PDFDocument();
  const buffers = [];

  return new Promise((resolve, reject) => {
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Content
    doc.fontSize(18).text('Charity Donation Receipt', { align: 'center' }).moveDown();
    doc.fontSize(12)
      .text(`Receipt ID: ${donation.id}`)
      .text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`)
      .text(`Charity: ${donation.Charity.name}`)
      .text(`Charity Email: ${donation.Charity.email}`)
      .text(`Amount Donated: $${donation.amount.toFixed(2)}`)
      .text(`Payment ID: ${donation.stripePaymentId || 'N/A'}`)
      .moveDown()
      .text('Thank you for your generous contribution!', { align: 'center' });

    doc.end();
  });
};

exports.generateAllReceipts = async (userId) => {
  const donations = await Donation.findAll({
    where: { UserId: userId },
    include: {
      model: Charity,
      attributes: ['name', 'email']
    },
    order: [['createdAt', 'DESC']]
  });

  if (!donations || donations.length === 0) {
    throw new Error('No donations found');
  }

  const doc = new PDFDocument();
  const buffers = [];

  return new Promise((resolve, reject) => {
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);

    // Content
    doc.fontSize(20).text('Donation History Receipt', { align: 'center' }).moveDown();

    donations.forEach((donation, index) => {
      doc.fontSize(14).text(`Donation #${index + 1}`);
      doc.fontSize(12)
        .text(`Date: ${new Date(donation.createdAt).toLocaleDateString()}`)
        .text(`Charity: ${donation.Charity.name}`)
        .text(`Charity Email: ${donation.Charity.email}`)
        .text(`Amount: $${donation.amount.toFixed(2)}`)
        .text(`Payment ID: ${donation.stripePaymentId || 'N/A'}`)
        .moveDown().moveDown();
    });

    doc.text('Thank you for all your generous contributions!', { align: 'center' });

    doc.end();
  });
};
