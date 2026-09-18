const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bookingRoutes = require("./routes/booking.routes");
const verificationRoutes = require("./routes/verification.routes");

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Mount routes at root level
app.use("/bookings", bookingRoutes);
app.use("/api/verification", verificationRoutes);

app.get("/health", (req, res) => {
  res.json({ service: "booking-service", status: "healthy" });
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route not found` });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

module.exports = app;