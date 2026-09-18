import { create } from "zustand";
import {
  getUserBookings,
  createBooking,
  cancelBooking,
  getBooking,
  checkAvailability,
  calculatePrice,
  getBuyerStats,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} from "../api/booking.api";
import toast from "react-hot-toast";

export const useBookingStore = create((set, get) => ({
  bookings: [],
  currentBooking: null,
  wishlist: [],
  buyerStats: null,
  isLoading: false,
  error: null,

  fetchUserBookings: async () => {
    set({ isLoading: true });
    try {
      const response = await getUserBookings();
      set({ bookings: response.data || [], isLoading: false });
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error("Failed to load bookings");
      set({ isLoading: false, bookings: [] });
    }
  },

  fetchBooking: async (bookingId) => {
    set({ isLoading: true });
    try {
      const response = await getBooking(bookingId);
      set({ currentBooking: response.data || response, isLoading: false });
    } catch (error) {
      console.error("Fetch booking error:", error);
      toast.error("Failed to load booking details");
      set({ isLoading: false });
    }
  },

  createBooking: async (bookingData) => {
    set({ isLoading: true });
    try {
      const response = await createBooking(bookingData);
      
      if (response.success) {
        toast.success("Booking created successfully!");
        await get().fetchUserBookings();
        return { success: true, data: response.data };
      }
      toast.error(response.message || "Failed to create booking");
      return { success: false };
    } catch (error) {
      console.error("Create booking error:", error);
      toast.error(error.response?.data?.message || "Failed to create booking");
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  cancelBooking: async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await cancelBooking(bookingId);
      if (response.success) {
        toast.success("Booking cancelled");
        await get().fetchUserBookings();
      }
    } catch (error) {
      console.error("Cancel booking error:", error);
      toast.error("Failed to cancel booking");
    }
  },

  checkAvailability: async (listingId, startDate, endDate) => {
    try {
      const response = await checkAvailability({ listingId, startDate, endDate });
      return response.data?.available || false;
    } catch (error) {
      console.error("Check availability error:", error);
      return false;
    }
  },

  // In booking.store.js, find calculatePrice function and replace with this:

calculatePrice: async (listingId, bookingData) => {
  try {
    console.log("======= STORE CALCULATE PRICE =======");
    console.log("Listing ID:", listingId);
    console.log("Booking data:", bookingData);
    
    // Ensure we have valid data
    const guests = bookingData.guests || bookingData.numberOfGuests || 1;
    const multiplier = bookingData.priceMultiplier || 1.0;
    
    const payload = {
      listingId: listingId,
      startDate: bookingData.startDate || new Date().toISOString().split('T')[0],
      endDate: bookingData.endDate || bookingData.startDate || new Date().toISOString().split('T')[0],
      guests: guests,
      ticketType: bookingData.ticketType || "adult",
      seatType: bookingData.seatType || "",
      priceMultiplier: multiplier
    };
    
    console.log("Sending payload:", payload);
    
    const response = await calculatePrice(payload);
    console.log("Response received:", response);
    
    if (response && response.success) {
      console.log("Price data:", response.data);
      return response.data;
    }
    
    console.log("No success in response");
    return null;
  } catch (error) {
    console.error("Store - Calculate price error:", error);
    return null;
  }
},

  fetchBuyerStats: async () => {
    try {
      const response = await getBuyerStats();
      set({ buyerStats: response.data || null });
    } catch (error) {
      console.error("Fetch buyer stats error:", error);
    }
  },

  fetchWishlist: async () => {
    try {
      const response = await getWishlist();
      let wishlistData = [];
      if (response?.data) {
        wishlistData = response.data;
      } else if (Array.isArray(response)) {
        wishlistData = response;
      }
      set({ wishlist: wishlistData });
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      set({ wishlist: [] });
    }
  },

  addToWishlist: async (listingId) => {
    try {
      const id = parseInt(listingId);
      const response = await addToWishlist(id);
      if (response.success) {
        toast.success("Added to wishlist");
        await get().fetchWishlist();
        return { success: true };
      }
      toast.error(response.message || "Failed to add to wishlist");
      return { success: false };
    } catch (error) {
      console.error("Add to wishlist error:", error);
      toast.error("Failed to add to wishlist");
      return { success: false };
    }
  },

  removeFromWishlist: async (listingId) => {
    try {
      const id = parseInt(listingId);
      const response = await removeFromWishlist(id);
      if (response.success) {
        toast.success("Removed from wishlist");
        await get().fetchWishlist();
        return { success: true };
      }
      toast.error(response.message || "Failed to remove from wishlist");
      return { success: false };
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      toast.error("Failed to remove from wishlist");
      return { success: false };
    }
  },

  clearCurrentBooking: () => {
    set({ currentBooking: null });
  }
}));