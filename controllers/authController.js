const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const sequelize = require("../config/db");
const jwtServices = require("../services/jwtService");

exports.signUp = async (req, res) => {
    const t = await sequelize.transaction();
    const name = req.body.name;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    try {
        const user = await User.findOne({
            where: { email: email },
            transaction: t,
        });
        if (user === null) {
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if (err) {
                    console.log(err);
                }
                await User.create(
                    {
                        name: name,
                        email: email,
                        phone: phone,
                        password: hash,
                    },
                    { transaction: t }
                );
                await t.commit();
                res.status(201).json({
                    success: true,
                    message: "New user created.",
                });
            });
        } else {
            res.status(403).json({
                message: "User already exists, Please login!",
            });
        }
    } catch (err) {
        await t.rollback();
        res.status(500).json(err);
    }
};

exports.logIn = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const token = jwtServices.generateAccessTokenOnLogin(user.id, user.name, user.isAdmin, user.email);
        res.status(200).json({
            message: 'Login successful',
            token,
            userId: user.id,
            userName: user.name,
            isAdmin: user.isAdmin, 
            email: user.email,        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
  const { name, street, apartment, zip, city, country } = req.body;

  try {
    const user = await User.findByPk(req.user.userId); // Ensure req.user.userId is used
    if (!user) {
      return res.status(404).json({ error: 'User not found' }); // Handle case where user is not found
    }

    user.name = name;
    user.street = street;
    user.apartment = apartment;
    user.zip = zip;
    user.city = city;
    user.country = country;
    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getProfile = async (req, res) => {
  try{
    const user = await User.findByPk(req.user.userId, {
      attributes: ['name', 'email', 'phone', 'street', 'apartment', 'zip', 'city', 'country'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};