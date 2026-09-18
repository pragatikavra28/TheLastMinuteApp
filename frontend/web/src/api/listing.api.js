import { listingClient } from "./clients";

export const getCategories = async () => {
  try {
    const response = await listingClient.get("/categories");
    return response.data;
  } catch (error) {
    console.error("getCategories API error:", error);
    throw error;
  }
};

export const createListing = async (data) => {
  try {
    console.log("API call to create listing:", data);
    const response = await listingClient.post("/", data);
    return response.data;
  } catch (error) {
    console.error("createListing API error:", error.response?.data || error);
    throw error;
  }
};

export const getListings = async (params = {}) => {
  try {
    const response = await listingClient.get("/search", { params });
    return response.data;
  } catch (error) {
    console.error("getListings API error:", error);
    throw error;
  }
};

export const getListing = async (id) => {
  try {
    const response = await listingClient.get(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("getListing API error:", error);
    throw error;
  }
};

export const getMyListings = async () => {
  try {
    const response = await listingClient.get("/my/listings");
    return response.data;
  } catch (error) {
    console.error("getMyListings API error:", error);
    throw error;
  }
};

export const searchListings = async (params) => {
  try {
    const response = await listingClient.get("/search", { params });
    return response.data;
  } catch (error) {
    console.error("searchListings API error:", error);
    throw error;
  }
};

export const toggleAvailability = async (id) => {
  try {
    const response = await listingClient.patch(`/${id}/availability`);
    return response.data;
  } catch (error) {
    console.error("toggleAvailability API error:", error);
    throw error;
  }
};

export const updateListing = async (id, data) => {
  try {
    const response = await listingClient.put(`/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("updateListing API error:", error);
    throw error;
  }
};

export const deleteListing = async (id) => {
  try {
    const response = await listingClient.delete(`/${id}`);
    return response.data;
  } catch (error) {
    console.error("deleteListing API error:", error);
    throw error;
  }
};

export const getSellerStats = async () => {
  try {
    const response = await listingClient.get("/seller/stats");
    return response.data;
  } catch (error) {
    console.error("getSellerStats API error:", error);
    throw error;
  }
};

export const getSellerListings = async () => {
  try {
    const response = await listingClient.get("/seller/listings");
    return response.data;
  } catch (error) {
    console.error("getSellerListings API error:", error);
    throw error;
  }
};