
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Donation = require('../models/Donation');
const Charity = require('../models/Charity');

exports.createDonationSession = async (req, res) => {
  try {
    const { amount, charityId } = req.body;
    const userId = req.user.userId; // ✅ Match your middleware
    const userEmail = req.user.email; 

    console.log('📝 Creating Donation Session');
    console.log(`💵 Amount: ${amount}`);
    console.log(`🏥 Charity ID: ${charityId}`);
    console.log(`👤 User ID: ${userId}`);

    // Save donation in DB first
    const donation = await Donation.create({
      amount: parseFloat(amount),
      charityId: parseInt(charityId),
      userId: parseInt(userId),
      stripePaymentId: null,
    });

    console.log(`✅ Donation record created with ID: ${donation.id}`);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Donation to Charity ID: ${charityId}`
            },
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
      

    console.log(`🛒 Stripe Session created with ID: ${session.id}`);

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('❌ Stripe Session Error:', err);
    res.status(500).json({ error: 'Failed to create Stripe session' });
  }
};

const brevoEmail = require('../config/email'); // Brevo instance
exports.confirmDonation = async (req, res) => {
  try {
    const { sessionId, donationId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paymentIntentId = session.payment_intent;
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (session.payment_status === 'paid') {
      const metadata = paymentIntent.metadata;

      const donation = await Donation.findByPk(donationId);
      if (!donation) return res.status(404).json({ error: 'Donation not found' });

      donation.UserId = parseInt(metadata.userId);
      donation.CharityId = parseInt(metadata.charityId);
      donation.stripePaymentId = paymentIntentId;
      await donation.save();

      const charity = await Charity.findByPk(donation.CharityId);
      if (!charity) return res.status(404).json({ error: 'Charity not found' });

      // 🧠 Extract recipient email from metadata
      const userEmail = metadata.email;
      const charityName = charity.name;

      // 📨 Setup email data
      const sendSmtpEmail = {
        to: [{ email: userEmail }],
        sender: {
          name: 'Charity Donation',
          email: process.env.BREVO_SENDER_EMAIL || 'tnr123457@gmail.com' // fallback in case env is not loaded
        },
        subject: `Your donation to ${charityName} was successful!`,
        htmlContent: `
          <h2>Thank You!</h2>
          <p>Your donation of <strong>$${donation.amount.toFixed(2)}</strong> to <strong>${charityName}</strong> has been received.</p>
          <p>Receipt ID: ${donation.id}<br>
          Payment ID: ${donation.stripePaymentId || 'N/A'}</p>
        `
      };

      // ✅ Log and try to send email
      console.log('📤 Attempting to send email...');
      console.log('📧 Sender:', sendSmtpEmail.sender.email);
      console.log('📨 Recipient:', userEmail);

      try {
        const result = await brevoEmail.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Email sent successfully:', result);
      } catch (emailErr) {
        console.error('❌ Email send failed:', emailErr.response?.body || emailErr.message);
      }

      return res.status(200).json({ message: 'Donation saved and email sent', donation });
    } else {
      return res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (err) {
    console.error('❌ Error confirming donation:', err.message);
    return res.status(500).json({ error: 'Failed to confirm donation' });
  }
};


exports.getDonationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const donations = await Donation.findAll({
      where: { UserId: userId },
      include: {
        model: Charity,
        attributes: ['name', 'email']
      },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(donations);
  } catch (err) {
    console.error('Error fetching donation history:', err);
    res.status(500).json({ error: 'Failed to fetch donation history' });
  }
};


//Download donation receipt as PDF
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');

exports.downloadDonationReceipt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const donationId = req.params.donationId;

    const donation = await Donation.findOne({
      where: {
        id: donationId,
        UserId: userId
      },
      include: {
        model: Charity,
        attributes: ['name', 'email']
      }
    });

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

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

  } catch (err) {
    console.error('Error generating donation receipt:', err);
    res.status(500).json({ error: 'Failed to generate receipt' });
  }
};

exports.downloadAllReceipts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const donations = await Donation.findAll({
      where: { UserId: userId },
      include: {
        model: Charity,
        attributes: ['name', 'email']
      },
      order: [['createdAt', 'DESC']]
    });

    if (!donations || donations.length === 0) {
      return res.status(404).json({ error: 'No donations found' });
    }

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

  } catch (err) {
    console.error('Error generating all receipts:', err);
    res.status(500).json({ error: 'Failed to generate receipts' });
  }
};
