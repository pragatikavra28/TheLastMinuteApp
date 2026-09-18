const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  try {
    if (!user || !user.id) {
      throw new Error("User data is required to generate token");
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      },
      process.env.JWT_SECRET || 'supersecretkey',
      { expiresIn: "7d" }
    );
    
    return token;
  } catch (error) {
    console.error("❌ Token generation error:", error);
    throw error;
  }
};

const generateRefreshToken = (user) => {
  try {
    if (!user || !user.id) {
      throw new Error("User data is required to generate token");
    }
    
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'refreshsecretkey',
      { expiresIn: "30d" }
    );
    
    return token;
  } catch (error) {
    console.error("❌ Refresh token generation error:", error);
    throw error;
  }
};

const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return null;
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };