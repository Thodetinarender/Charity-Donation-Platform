const authService = require('../services/authService');

// Sign up a new user
exports.signUp = async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const newUser = await authService.signUp(name, email, phone, password);
    res.status(201).json({
      success: true,
      message: 'New user created.',
      user: newUser,
    });
  } catch (err) {
    console.error('❌ Error in signUp:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Log in a user
exports.logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { token, user } = await authService.logIn(email, password);
    res.status(200).json({
      message: 'Login successful',
      token,
      userId: user.id,
      userName: user.name,
      isAdmin: user.isAdmin,
      email: user.email,
    });
  } catch (err) {
    console.error('❌ Error in logIn:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const userId = req.user.userId; // Ensure req.user.userId is available
  const profileData = req.body;

  try {
    const updatedUser = await authService.updateProfile(userId, profileData);
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('❌ Error in updateProfile:', err.message);
    res.status(400).json({ error: err.message });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  const userId = req.user.userId; // Ensure req.user.userId is available

  try {
    const user = await authService.getProfile(userId);
    res.status(200).json(user);
  } catch (err) {
    console.error('❌ Error in getProfile:', err.message);
    res.status(400).json({ error: err.message });
  }
};