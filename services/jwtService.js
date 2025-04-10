const jwt = require("jsonwebtoken");

exports.generateAccessTokenOnPremium = (id, name, isPremium) => {
    return jwt.sign(
        { userId: id, name: name, isPremium: isPremium },
        process.env.JWT_SECRET
    );
};

exports.generateAccessTokenOnLogin = (id, name, isAdmin,email) => {
    return jwt.sign(
      { userId: id, userName: name, isAdmin: isAdmin, email: email }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  };
  