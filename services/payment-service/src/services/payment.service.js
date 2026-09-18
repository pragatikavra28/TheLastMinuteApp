// Simple Mock Payment Service
class PaymentService {
    constructor() {
        console.log("✅ Payment Service Ready (Mock Mode)");
    }

    async createPaymentIntent(amount, currency = 'inr', metadata = {}) {
        console.log(`💰 Processing payment of ₹${amount}`);
        
        const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
        
        return {
            success: true,
            paymentId: paymentId,
            status: 'succeeded',
            amount: amount,
            currency: currency
        };
    }
}

module.exports = new PaymentService();