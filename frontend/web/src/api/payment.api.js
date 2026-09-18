import { paymentClient } from "./clients";

export const createPayment = async (bookingId, amount) => {
  try {
    const response = await paymentClient.post("/create", {
      bookingId,
      amount,
      currency: 'inr'
    });
    return response.data;
  } catch (error) {
    console.error("Create payment error:", error);
    throw error;
  }
};

export const getPaymentStatus = async (bookingId) => {
  try {
    const response = await paymentClient.get(`/${bookingId}/status`);
    return response.data;
  } catch (error) {
    console.error("Get payment status error:", error);
    throw error;
  }
};