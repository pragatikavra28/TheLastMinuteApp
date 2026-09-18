const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/booking.controller");
const buyerController = require("../controllers/buyer.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes
router.get("/check-availability", bookingController.checkAvailability);
router.post("/calculate-price", bookingController.calculatePrice);

// Protected routes
router.use(authMiddleware);

// Wishlist routes - MUST COME FIRST
router.get("/wishlist", buyerController.getWishlist);
router.post("/wishlist", buyerController.addToWishlist);
router.delete("/wishlist/:listingId", buyerController.removeFromWishlist);

// Buyer stats routes
router.get("/buyer/stats", buyerController.getBuyerStats);

// Booking routes
router.post("/", bookingController.createBooking);
router.get("/my-bookings", bookingController.getUserBookings);
router.put("/:id/cancel", bookingController.cancelBooking);
// Add this route
router.put("/:id/payment-status", authMiddleware, bookingController.updatePaymentStatus);
// Dynamic route - MUST COME LAST
router.get("/:id", bookingController.getBookingById);

module.exports = router;