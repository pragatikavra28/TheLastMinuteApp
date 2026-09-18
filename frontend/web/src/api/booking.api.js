import { bookingClient } from "./clients";

export const createBooking = async (data) => {
  try {
    console.log("Creating booking with data:", data);
    // FIXED: Use /bookings (not /bookings/bookings)
    const response = await bookingClient.post("/bookings", {
      listingId: data.listingId,
      startDate: data.startDate,
      endDate: data.endDate,
      numberOfGuests: data.numberOfGuests,
      totalPrice: data.totalPrice
    });
    return response.data;
  } catch (error) {
    console.error("createBooking API error:", error.response?.data || error);
    throw error;
  }
};

export const getUserBookings = async () => {
  // FIXED: Use /bookings/my-bookings
  const response = await bookingClient.get("/bookings/my-bookings");
  return response.data;
};

export const getBooking = async (id) => {
  const response = await bookingClient.get(`/bookings/${id}`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await bookingClient.put(`/bookings/${id}/cancel`);
  return response.data;
};

export const checkAvailability = async (params) => {
  // FIXED: Use /bookings/check-availability
  const response = await bookingClient.get("/bookings/check-availability", { params });
  return response.data;
};

export const calculatePrice = async (data) => {
  try {
    console.log("API - Calculating price with data:", data);
    const response = await bookingClient.post("/bookings/calculate-price", {
      listingId: data.listingId,
      startDate: data.startDate,
      endDate: data.endDate,
      guests: data.guests,
      ticketType: data.ticketType,
      seatType: data.seatType,
      priceMultiplier: data.priceMultiplier
    });
    console.log("API - Price calculation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("calculatePrice API error:", error.response?.data || error);
    throw error;
  }
};

export const getBuyerStats = async () => {
  const response = await bookingClient.get("/bookings/buyer/stats");
  return response.data;
};

export const getWishlist = async () => {
  try {
    const response = await bookingClient.get("/bookings/wishlist");
    return response.data;
  } catch (error) {
    console.error("getWishlist API error:", error);
    return { success: true, data: [] };
  }
};

export const addToWishlist = async (listingId) => {
  try {
    const response = await bookingClient.post("/bookings/wishlist", { listingId });
    return response.data;
  } catch (error) {
    console.error("addToWishlist API error:", error);
    throw error;
  }
};

export const removeFromWishlist = async (listingId) => {
  try {
    const response = await bookingClient.delete(`/bookings/wishlist/${listingId}`);
    return response.data;
  } catch (error) {
    console.error("removeFromWishlist API error:", error);
    throw error;
  }
};