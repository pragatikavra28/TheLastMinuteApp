const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes - require authentication
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/me", authMiddleware, authController.getMe);
router.put("/verification-status", authMiddleware, authController.updateVerificationStatus);
router.get("/check-verification", authMiddleware, authController.checkVerification);

module.exports = router;