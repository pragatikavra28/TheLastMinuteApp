const listingModel = require("../models/listing.model");

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await listingModel.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

// Create listing
exports.createListing = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const listingData = {
      title: req.body.title,
      description: req.body.description || "",
      price: parseFloat(req.body.price),
      owner_id: req.user.id,
      category_id: parseInt(req.body.category_id),
      location: req.body.location || "",
      city: req.body.city || "",
      address: req.body.address || ""
    };

    const listing = await listingModel.createListing(listingData);
    res.status(201).json({ success: true, message: "Listing created", data: listing });
  } catch (error) {
    console.error("Create listing error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get listing by ID
exports.getListingById = async (req, res) => {
  try {
    const listing = await listingModel.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, data: listing });
  } catch (error) {
    console.error("Get listing error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch listing" });
  }
};

// Get my listings (for seller)
exports.getMyListings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const listings = await listingModel.getListingsByOwner(req.user.id);
    res.json({ success: true, data: listings });
  } catch (error) {
    console.error("Get my listings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch listings" });
  }
};

// Search listings
exports.searchListings = async (req, res) => {
  try {
    const listings = await listingModel.searchListings(req.query);
    res.json({ success: true, data: listings, total: listings.length });
  } catch (error) {
    console.error("Search listings error:", error);
    res.status(500).json({ success: false, message: "Failed to search listings" });
  }
};

// Toggle availability
exports.toggleAvailability = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const listing = await listingModel.toggleAvailability(req.params.id, req.user.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, message: "Availability updated", data: listing });
  } catch (error) {
    console.error("Toggle availability error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle availability" });
  }
};

// Update listing
exports.updateListing = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const listing = await listingModel.updateListing(req.params.id, req.user.id, req.body);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, message: "Listing updated", data: listing });
  } catch (error) {
    console.error("Update listing error:", error);
    res.status(500).json({ success: false, message: "Failed to update listing" });
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const listing = await listingModel.deleteListing(req.params.id, req.user.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, message: "Listing deleted" });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({ success: false, message: "Failed to delete listing" });
  }
};