const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User  = require('../models/user');

const Charity = sequelize.define('Charity', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  mission: {
    type: DataTypes.TEXT,
  },
  goals: {
    type: DataTypes.TEXT,
  },
  projects: {
    type: DataTypes.TEXT,
  },
  street: {
    type: DataTypes.STRING,
  },
  apartment: {
    type: DataTypes.STRING,
  },
  zip: {
    type: DataTypes.STRING,
  },
  city: {
    type: DataTypes.STRING,
  },
  country: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

User.hasMany(Charity, { foreignKey: 'createdBy' });
Charity.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = Charity;
