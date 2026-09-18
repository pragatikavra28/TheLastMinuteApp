import { authClient } from "./clients";

export const registerUser = async (data) => {
  const response = await authClient.post("/auth/register", data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await authClient.post("/auth/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await authClient.get("/auth/profile");
  return response.data;
};

export const getMe = async () => {
  // Try /auth/me first, fallback to /me
  try {
    const response = await authClient.get("/auth/me");
    return response.data;
  } catch (error) {
    // Fallback to root /me endpoint
    const response = await authClient.get("/me");
    return response.data;
  }
};