// models/Donation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Charity = require('./Charity');
const User = require('./user');

const Donation = sequelize.define('Donation', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  stripePaymentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
}, {
  timestamps: true
});

// Associations
User.hasMany(Donation);
Donation.belongsTo(User);

Charity.hasMany(Donation);
Donation.belongsTo(Charity);

module.exports = Donation;
