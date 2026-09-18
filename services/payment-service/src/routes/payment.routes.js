const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authMiddleware);

// Create payment
router.post("/create", paymentController.createPayment);

// Get payment status
router.get("/:bookingId/status", paymentController.getPaymentStatus);

module.exports = router;