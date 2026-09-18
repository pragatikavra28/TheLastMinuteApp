const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verification.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/upload-document", verificationController.upload.single("document"), verificationController.uploadDocument);
router.get("/documents", verificationController.getUserDocuments);
router.post("/check-eligibility", verificationController.checkBookingEligibility);
router.post("/verify-guests", verificationController.verifyBookingGuests);

module.exports = router;