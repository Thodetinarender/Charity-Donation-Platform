const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwtServices = require('./jwtService');
const sequelize = require('../config/db');

// Sign up a new user
exports.signUp = async (name, email, phone, password) => {
  const t = await sequelize.transaction();
  try {
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      await t.rollback();
      throw new Error('User already exists, please login!');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create(
      { name, email, phone, password: hashedPassword },
      { transaction: t }
    );

    await t.commit();
    return newUser;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// Log in a user
exports.logIn = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = jwtServices.generateAccessTokenOnLogin(user.id, user.name, user.isAdmin, user.email);
  return { token, user };
};

// Update user profile
exports.updateProfile = async (userId, profileData) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  Object.assign(user, profileData);
  await user.save();
  return user;
};

// Get user profile
exports.getProfile = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: ['name', 'email', 'phone', 'street', 'apartment', 'zip', 'city', 'country'],
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};