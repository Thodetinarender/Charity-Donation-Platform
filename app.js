require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const charityRoutes = require('./routes/charityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const homeRoutes = require('./routes/homeRoutes');
const donationRoutes = require('./routes/donationRoutes');




const User = require('./models/user');


const app = express();

// Ensure body-parser middleware is applied
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.use(express.static(path.join(__dirname, 'public')));

// Public routes (no authentication required)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", 'signup.html'));
});

app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "signup.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html", "login.html"));
});

app.use('/api/v1/users', authRoutes);
app.use('/api', homeRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/admin/charities', adminRoutes); // For admin-only charity management
app.use('/api/donations', donationRoutes);

app.use('/uploads', express.static('uploads'));


process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

sequelize.sync({ force: true }).then(() => { // Avoid using alter: true true
  app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});