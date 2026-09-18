import axios from "axios";

const API_URLS = {
  auth: "http://localhost:4001",
  listing: "http://localhost:4002",
  booking: "http://localhost:4003",
  payment: "http://localhost:4004"
};

export const authClient = axios.create({
  baseURL: API_URLS.auth,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const listingClient = axios.create({
  baseURL: `${API_URLS.listing}/api/listings`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const bookingClient = axios.create({
  baseURL: API_URLS.booking,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

export const verificationClient = axios.create({
  baseURL: `${API_URLS.booking}/api/verification`,
  timeout: 30000,
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const paymentClient = axios.create({
  baseURL: `${API_URLS.payment}/api/payments`,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

const clients = [authClient, listingClient, bookingClient, verificationClient, paymentClient];

clients.forEach(client => {
  client.interceptors.request.use(
    config => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`📡 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    },
    error => Promise.reject(error)
  );

  client.interceptors.response.use(
    response => {
      console.log(`✅ ${response.config.url} - ${response.status}`);
      return response;
    },
    error => {
      console.error(`❌ ${error.config?.url} - ${error.response?.status}`, error.response?.data);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
});