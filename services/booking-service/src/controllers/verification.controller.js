const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ocrService = require("../services/ocr.service");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, "../uploads/documents");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `doc-${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Only image files (jpeg, jpg, png) are allowed"));
        }
    }
});

// Upload and verify document
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { documentType, fullName, documentNumber } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Document image is required" });
        }

        if (!fullName || !documentNumber) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                success: false, 
                message: "Full name and document number are required" 
            });
        }

        console.log("Uploading document for user:", req.user.id);
        console.log("Document details:", { documentType, fullName, documentNumber });

        // Check if user already has a verified document
        const existingDoc = await pool.query(
            `SELECT id, verification_status FROM user_documents 
             WHERE user_id = $1 AND verification_status = 'VERIFIED'`,
            [req.user.id]
        );

        if (existingDoc.rows.length > 0) {
            console.log("User already has a verified document");
            
            // Update existing document instead of creating new one
            const updateResult = await pool.query(
                `UPDATE user_documents 
                 SET document_type = $1, 
                     document_number = $2, 
                     full_name = $3,
                     front_image_url = $4,
                     ocr_data = $5,
                     verification_status = 'VERIFIED',
                     updated_at = NOW()
                 WHERE id = $6
                 RETURNING id`,
                [
                    documentType,
                    documentNumber,
                    fullName,
                    `/uploads/documents/${path.basename(req.file.path)}`,
                    JSON.stringify({ success: true, extractedData: { fullName, documentNumber } }),
                    existingDoc.rows[0].id
                ]
            );

            // Update user verification status
            await pool.query(
                `UPDATE users SET 
                    verification_status = 'VERIFIED',
                    primary_document_id = $1,
                    verified_at = NOW(),
                    updated_at = NOW()
                 WHERE id = $2`,
                [updateResult.rows[0].id, req.user.id]
            );

            // Delete old file if it exists and is different
            if (existingDoc.rows[0].front_image_url) {
                const oldFilePath = path.join(__dirname, "../uploads/documents", path.basename(existingDoc.rows[0].front_image_url));
                if (fs.existsSync(oldFilePath) && oldFilePath !== req.file.path) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            return res.json({
                success: true,
                message: "Document updated and verified successfully",
                data: {
                    documentId: updateResult.rows[0].id,
                    verificationStatus: 'VERIFIED',
                    extractedData: { fullName, documentNumber }
                }
            });
        }

        // No existing document, create new one
        const imageBuffer = fs.readFileSync(req.file.path);
        
        // Verify document using OCR service
        const verificationResult = await ocrService.verifyDocument(
            imageBuffer, 
            documentType,
            { fullName, documentNumber }
        );

        if (!verificationResult.success) {
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: verificationResult.error || "Document verification failed"
            });
        }

        // Save new document to database
        const result = await pool.query(
            `INSERT INTO user_documents (
                user_id, document_type, document_number, full_name,
                front_image_url, ocr_data, verification_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [
                req.user.id,
                documentType,
                documentNumber,
                fullName,
                `/uploads/documents/${path.basename(req.file.path)}`,
                JSON.stringify(verificationResult),
                'VERIFIED'
            ]
        );

        // Update user verification status
        await pool.query(
            `UPDATE users SET 
                verification_status = 'VERIFIED',
                primary_document_id = $1,
                verified_at = NOW(),
                updated_at = NOW()
             WHERE id = $2`,
            [result.rows[0].id, req.user.id]
        );

        res.json({
            success: true,
            message: "Document verified successfully",
            data: {
                documentId: result.rows[0].id,
                verificationStatus: 'VERIFIED',
                extractedData: verificationResult.extractedData,
                validation: verificationResult.validation
            }
        });

    } catch (error) {
        console.error("Upload document error:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            try { fs.unlinkSync(req.file.path); } catch(e) {}
        }
        
        // Handle duplicate key error specifically
        if (error.code === '23505') {
            return res.status(400).json({
                success: false,
                message: "You have already submitted this document. Please contact support if you need to update it."
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload document"
        });
    }
};

// Get user documents
exports.getUserDocuments = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, document_type, document_number, full_name, 
                    verification_status, verified_at, created_at
             FROM user_documents
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error("Get documents error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch documents"
        });
    }
};

// Check booking eligibility
exports.checkBookingEligibility = async (req, res) => {
    try {
        const { listingId, numberOfGuests } = req.body;

        const listing = await pool.query(
            `SELECT l.*, c.name as category_name
             FROM listings l
             JOIN categories c ON l.category_id = c.id
             WHERE l.id = $1`,
            [listingId]
        );

        if (listing.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Listing not found"
            });
        }

        const category = listing.rows[0].category_name?.toLowerCase();
        const userVerification = await pool.query(
            `SELECT verification_status FROM users WHERE id = $1`,
            [req.user.id]
        );

        if (userVerification.rows[0]?.verification_status !== 'VERIFIED') {
            return res.json({
                success: false,
                requiresVerification: true,
                message: "Please complete document verification before booking"
            });
        }

        if (category === 'movie' || category === 'concert') {
            const documents = await pool.query(
                `SELECT COUNT(*) as doc_count FROM user_documents 
                 WHERE user_id = $1 AND verification_status = 'VERIFIED'`,
                [req.user.id]
            );

            const verifiedDocs = parseInt(documents.rows[0].doc_count);
            
            if (verifiedDocs < numberOfGuests) {
                return res.json({
                    success: false,
                    requiresGuestVerification: true,
                    message: `This booking requires ${numberOfGuests} verified guests. Please upload ${numberOfGuests - verifiedDocs} more ID documents.`,
                    verifiedDocs,
                    requiredDocs: numberOfGuests
                });
            }
        }

        res.json({
            success: true,
            message: "User is eligible to book",
            category
        });
    } catch (error) {
        console.error("Check eligibility error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check eligibility"
        });
    }
};

// Verify booking guests
exports.verifyBookingGuests = async (req, res) => {
    try {
        const { bookingId, guests } = req.body;
        
        const booking = await pool.query(
            `SELECT b.*, l.category_id, c.name as category_name
             FROM bookings b
             JOIN listings l ON b.listing_id = l.id
             JOIN categories c ON l.category_id = c.id
             WHERE b.id = $1 AND b.user_id = $2`,
            [bookingId, req.user.id]
        );

        if (booking.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const bookingData = booking.rows[0];
        const category = bookingData.category_name?.toLowerCase();

        if (category === 'hotel' || category === 'restaurant') {
            return res.json({
                success: true,
                message: "No verification required for this booking type"
            });
        }

        if (category === 'movie' || category === 'concert') {
            if (guests.length !== bookingData.number_of_guests) {
                return res.status(400).json({
                    success: false,
                    message: `Please provide verification for all ${bookingData.number_of_guests} guests`
                });
            }

            const userDocs = await pool.query(
                `SELECT id, document_number, full_name
                 FROM user_documents
                 WHERE user_id = $1 AND verification_status = 'VERIFIED'`,
                [req.user.id]
            );

            const verifiedGuests = [];
            for (const guest of guests) {
                const matchedDoc = userDocs.rows.find(
                    doc => doc.full_name?.toLowerCase() === guest.name?.toLowerCase() ||
                           doc.document_number === guest.documentNumber
                );

                if (!matchedDoc) {
                    return res.status(400).json({
                        success: false,
                        message: `Verification failed for guest: ${guest.name}. Please upload their ID document.`
                    });
                }

                await pool.query(
                    `INSERT INTO booking_verifications (
                        booking_id, user_id, document_id, guest_name, guest_document_number, verified
                    ) VALUES ($1, $2, $3, $4, $5, $6)`,
                    [bookingId, req.user.id, matchedDoc.id, guest.name, guest.documentNumber, true]
                );

                verifiedGuests.push(guest.name);
            }

            await pool.query(
                `UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`,
                [bookingId]
            );

            res.json({
                success: true,
                message: `All ${verifiedGuests.length} guests verified successfully`,
                data: { verifiedGuests }
            });
        }
    } catch (error) {
        console.error("Verify booking guests error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify guests"
        });
    }
};

// Export upload middleware
exports.upload = upload;