const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '7d';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      name: user.name,
      verification_status: user.verification_status || 'UNVERIFIED'
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role === 'seller' ? 'seller' : 'buyer';

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, is_verified, verification_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id, name, email, role, phone, is_verified, verification_status, created_at`,
      [name, email.toLowerCase(), hashedPassword, userRole, phone || null, true, 'UNVERIFIED']
    );

    const user = result.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          is_verified: user.is_verified,
          verification_status: user.verification_status
        },
        token
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed. Please try again."
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const user = result.rows[0];
    const validPassword = await comparePassword(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid email or password" 
      });
    }

    const token = generateToken(user);
    
    delete user.password;

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar_url: user.avatar_url,
          is_verified: user.is_verified,
          verification_status: user.verification_status || 'UNVERIFIED'
        },
        token
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Login failed. Please try again."
    });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, avatar_url, is_verified, verification_status, created_at 
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch profile" 
    });
  }
};

// Get current user (ME) - FIXED endpoint
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log("Getting user data for ID:", userId);
    
    const result = await pool.query(
      `SELECT id, name, email, role, phone, avatar_url, is_verified, verification_status, created_at 
       FROM users 
       WHERE id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const user = result.rows[0];
    
    // Check if user has verified documents
    let verifiedDocsCount = 0;
    try {
      const docsResult = await pool.query(
        `SELECT COUNT(*) as count FROM user_documents 
         WHERE user_id = $1 AND verification_status = 'VERIFIED'`,
        [userId]
      );
      verifiedDocsCount = parseInt(docsResult.rows[0]?.count || 0);
      
      if (verifiedDocsCount > 0 && user.verification_status !== 'VERIFIED') {
        await pool.query(
          `UPDATE users SET verification_status = 'VERIFIED', verified_at = NOW() WHERE id = $1`,
          [userId]
        );
        user.verification_status = 'VERIFIED';
      }
    } catch (err) {
      console.log("Document table check skipped");
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar_url: user.avatar_url,
        is_verified: user.is_verified,
        verification_status: user.verification_status || 'UNVERIFIED',
        verified_documents_count: verifiedDocsCount
      }
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user data"
    });
  }
};

// Update verification status
exports.updateVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.body;

    if (!status || !['VERIFIED', 'UNVERIFIED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification status"
      });
    }

    await pool.query(
      `UPDATE users SET verification_status = $1, updated_at = NOW() WHERE id = $2`,
      [status, userId]
    );

    const userResult = await pool.query(
      `SELECT id, name, email, role, verification_status FROM users WHERE id = $1`,
      [userId]
    );

    res.json({
      success: true,
      message: "Verification status updated",
      data: userResult.rows[0]
    });
  } catch (error) {
    console.error("Update verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update verification status"
    });
  }
};

// Check if user is verified
exports.checkVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT verification_status FROM users WHERE id = $1`,
      [userId]
    );

    const verificationStatus = result.rows[0]?.verification_status || 'UNVERIFIED';
    
    let verifiedDocsCount = 0;
    try {
      const docsResult = await pool.query(
        `SELECT COUNT(*) as count FROM user_documents 
         WHERE user_id = $1 AND verification_status = 'VERIFIED'`,
        [userId]
      );
      verifiedDocsCount = parseInt(docsResult.rows[0]?.count || 0);
    } catch (err) {}

    res.json({
      success: true,
      data: {
        verified: verificationStatus === 'VERIFIED',
        verificationStatus,
        verifiedDocumentsCount: verifiedDocsCount
      }
    });
  } catch (error) {
    console.error("Check verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check verification status"
    });
  }
};