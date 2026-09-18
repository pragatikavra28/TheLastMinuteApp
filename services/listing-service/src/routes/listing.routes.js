const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listing.controller");
const sellerController = require("../controllers/seller.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Public routes (no authentication required)
router.get("/categories", listingController.getCategories);
router.get("/search", listingController.searchListings);
router.get("/:id", listingController.getListingById);

// Protected routes (authentication required)
router.post("/", authMiddleware, listingController.createListing);
router.get("/my/listings", authMiddleware, listingController.getMyListings);
router.patch("/:id/availability", authMiddleware, listingController.toggleAvailability);
router.put("/:id", authMiddleware, listingController.updateListing);
router.delete("/:id", authMiddleware, listingController.deleteListing);

// Seller routes (authentication required)
router.get("/seller/stats", authMiddleware, sellerController.getSellerStats);
router.get("/seller/listings", authMiddleware, sellerController.getSellerListings);

module.exports = router;