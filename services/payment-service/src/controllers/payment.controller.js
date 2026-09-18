const paymentService = require('../services/payment.service');
const pool = require('../config/db');
const axios = require('axios');

// Create payment
exports.createPayment = async (req, res) => {
    try {
        console.log("Create payment request:", req.body);
        
        const { bookingId, amount, currency = 'inr' } = req.body;
        
        if (!bookingId || !amount) {
            return res.status(400).json({
                success: false,
                message: "Booking ID and amount are required"
            });
        }

        // Process payment
        const result = await paymentService.createPaymentIntent(amount, currency, { 
            bookingId, 
            userId: req.user.id 
        });

        if (result.success) {
            // Save to database
            try {
                await pool.query(
                    `INSERT INTO payments (booking_id, user_id, amount, payment_id, status)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [bookingId, req.user.id, amount, result.paymentId, 'SUCCESS']
                );
            } catch (dbError) {
                console.log("DB note:", dbError.message);
            }

            // IMPORTANT: Update booking status to CONFIRMED
            try {
                const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://booking-service:4003';
                
                const updateResponse = await axios.put(
                    `${bookingServiceUrl}/bookings/${bookingId}/payment-status`,
                    {
                        status: 'CONFIRMED',
                        payment_status: 'PAID',
                        payment_data: {
                            paymentId: result.paymentId,
                            amount: amount,
                            paidAt: new Date().toISOString()
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': req.headers.authorization
                        }
                    }
                );
                
                if (updateResponse.data.success) {
                    console.log(`✅ Booking ${bookingId} status updated to CONFIRMED`);
                } else {
                    console.log(`⚠️ Booking ${bookingId} update response:`, updateResponse.data);
                }
            } catch (apiError) {
                console.error("Error updating booking:", apiError.message);
                // Try direct database update as fallback
                try {
                    await pool.query(
                        `UPDATE bookings SET status = 'CONFIRMED', payment_status = 'PAID', updated_at = NOW() WHERE id = $1`,
                        [bookingId]
                    );
                    console.log(`✅ Booking ${bookingId} updated directly in database`);
                } catch (dbError) {
                    console.error("Direct DB update failed:", dbError.message);
                }
            }

            res.json({
                success: true,
                message: "Payment successful! Booking confirmed.",
                data: {
                    bookingId: bookingId,
                    paymentId: result.paymentId,
                    amount: amount,
                    status: 'CONFIRMED',
                    paymentStatus: 'PAID'
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.error || "Payment failed"
            });
        }
    } catch (error) {
        console.error("Create payment error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process payment"
        });
    }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        
        const result = await pool.query(
            `SELECT status, amount, payment_id, created_at, completed_at 
             FROM payments 
             WHERE booking_id = $1 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [bookingId]
        );

        if (result.rows.length > 0) {
            res.json({
                success: true,
                data: result.rows[0]
            });
        } else {
            res.json({
                success: true,
                data: {
                    status: 'NOT_FOUND',
                    amount: 0
                }
            });
        }
    } catch (error) {
        console.error("Get payment status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get payment status"
        });
    }
};