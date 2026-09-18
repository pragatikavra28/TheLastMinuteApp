const bcrypt = require("bcryptjs");

const hashPassword = async (password) => {
  try {
    if (!password) {
      throw new Error("Password is required");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.error("❌ Password hashing error:", error);
    throw error;
  }
};

const comparePassword = async (password, hash) => {
  try {
    if (!password || !hash) {
      console.log("⚠️ Missing password or hash for comparison");
      return false;
    }
    const match = await bcrypt.compare(password, hash);
    return match;
  } catch (error) {
    console.error("❌ Password comparison error:", error);
    return false;
  }
};

module.exports = { hashPassword, comparePassword };