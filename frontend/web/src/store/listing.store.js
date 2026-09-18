import { create } from "zustand";
import {
  getCategories,
  getListings,
  getListing,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
  toggleAvailability,
  searchListings,
  getSellerStats,
  getSellerListings
} from "../api/listing.api";
import toast from "react-hot-toast";

export const useListingStore = create((set, get) => ({
  categories: [],
  listings: [],
  currentListing: null,
  sellerListings: [],
  sellerStats: null,
  isLoading: false,
  error: null,
  filters: {
    query: "",
    category: "",
    location: "",
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    guests: "",
    instantBook: false,
    sortBy: "created_at DESC"
  },

  fetchCategories: async () => {
    try {
      set({ isLoading: true });
      console.log("Fetching categories...");
      const response = await getCategories();
      console.log("Categories API response:", response);
      
      let categoriesData = [];
      if (response?.success === true && response?.data) {
        categoriesData = response.data;
      } else if (response?.data) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      console.log("Setting categories in store:", categoriesData);
      set({ categories: categoriesData, isLoading: false });
      return categoriesData;
    } catch (error) {
      console.error("Fetch categories error in store:", error);
      toast.error("Failed to load categories");
      set({ isLoading: false, categories: [] });
      return [];
    }
  },

  searchListings: async (filters = {}) => {
    set({ isLoading: true });
    try {
      const currentFilters = { ...get().filters, ...filters };
      const response = await searchListings(currentFilters);
      
      let listingsData = [];
      if (response?.success === true && response?.data) {
        listingsData = response.data;
      } else if (response?.data) {
        listingsData = response.data;
      } else if (Array.isArray(response)) {
        listingsData = response;
      }
      
      set({ 
        listings: listingsData, 
        filters: currentFilters,
        isLoading: false 
      });
    } catch (error) {
      console.error("Search listings error:", error);
      toast.error("Failed to load listings");
      set({ isLoading: false });
    }
  },

  fetchListing: async (id) => {
    set({ isLoading: true });
    try {
      const response = await getListing(id);
      
      let listingData = null;
      if (response?.success === true && response?.data) {
        listingData = response.data;
      } else if (response?.data) {
        listingData = response.data;
      } else if (response && typeof response === 'object') {
        listingData = response;
      }
      
      set({ currentListing: listingData, isLoading: false });
    } catch (error) {
      console.error("Fetch listing error:", error);
      toast.error("Failed to load listing");
      set({ isLoading: false });
    }
  },

  fetchMyListings: async () => {
    set({ isLoading: true });
    try {
      const response = await getMyListings();
      
      let listingsData = [];
      if (response?.success === true && response?.data) {
        listingsData = response.data;
      } else if (response?.data) {
        listingsData = response.data;
      } else if (Array.isArray(response)) {
        listingsData = response;
      }
      
      set({ listings: listingsData, isLoading: false });
    } catch (error) {
      console.error("Fetch my listings error:", error);
      toast.error("Failed to load your listings");
      set({ isLoading: false });
    }
  },

  createListing: async (listingData) => {
  set({ isLoading: true });
  try {
    console.log("Sending to backend:", listingData);
    
    const response = await createListing(listingData);
    console.log("Backend response:", response);
    
    if (response && response.success === true) {
      toast.success("Listing created successfully!");
      await get().fetchMyListings();
      return { success: true, data: response.data };
    }
    
    toast.error(response?.message || "Failed to create listing");
    return { success: false };
  } catch (error) {
    console.error("Create listing error:", error);
    toast.error(error.response?.data?.message || "Failed to create listing");
    return { success: false };
  } finally {
    set({ isLoading: false });
  }
},

  updateListing: async (id, listingData) => {
    set({ isLoading: true });
    try {
      const response = await updateListing(id, listingData);
      
      if (response && response.success === true) {
        toast.success("Listing updated successfully!");
        await get().fetchMyListings();
        return { success: true, data: response.data };
      }
      
      toast.error(response?.message || "Failed to update listing");
      return { success: false };
    } catch (error) {
      console.error("Update listing error:", error);
      toast.error("Failed to update listing");
      return { success: false };
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAvailability: async (id) => {
    try {
      const response = await toggleAvailability(id);
      if (response && response.success === true) {
        toast.success("Availability updated");
        await get().fetchMyListings();
      } else {
        toast.error(response?.message || "Failed to update availability");
      }
    } catch (error) {
      console.error("Toggle availability error:", error);
      toast.error("Failed to update availability");
    }
  },

  deleteListing: async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      const response = await deleteListing(id);
      if (response && response.success === true) {
        toast.success("Listing deleted");
        await get().fetchMyListings();
      } else {
        toast.error(response?.message || "Failed to delete listing");
      }
    } catch (error) {
      console.error("Delete listing error:", error);
      toast.error("Failed to delete listing");
    }
  },

  fetchSellerStats: async () => {
    set({ isLoading: true });
    try {
      const response = await getSellerStats();
      
      let statsData = null;
      if (response?.success === true && response?.data) {
        statsData = response.data;
      } else if (response?.data) {
        statsData = response.data;
      } else if (response && typeof response === 'object') {
        statsData = response;
      }
      
      set({ sellerStats: statsData, isLoading: false });
    } catch (error) {
      console.error("Fetch seller stats error:", error);
      toast.error("Failed to load seller stats");
      set({ isLoading: false, error: error.message });
    }
  },

  fetchSellerListings: async () => {
  try {
    console.log("Fetching seller listings...");
    const response = await getSellerListings();
    console.log("Seller listings response:", response);
    
    let listingsData = [];
    if (response?.success === true && response?.data) {
      listingsData = response.data;
    } else if (response?.data) {
      listingsData = response.data;
    } else if (Array.isArray(response)) {
      listingsData = response;
    }
    
    console.log("Setting seller listings:", listingsData);
    set({ sellerListings: listingsData });
    return listingsData;
  } catch (error) {
    console.error("Fetch seller listings error:", error);
    toast.error("Failed to load seller listings");
    set({ sellerListings: [] });
    return [];
  }
},

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  resetFilters: () => {
    set({
      filters: {
        query: "",
        category: "",
        location: "",
        minPrice: "",
        maxPrice: "",
        startDate: "",
        endDate: "",
        guests: "",
        instantBook: false,
        sortBy: "created_at DESC"
      }
    });
  },

  clearCurrentListing: () => {
    set({ currentListing: null });
  }
}));