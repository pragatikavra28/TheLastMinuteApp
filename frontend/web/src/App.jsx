import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import LandingPage from "./pages/Home/LandingPage";
import BuyerDashboard from "./pages/Buyer/BuyerDashboard";
import MyBookings from "./pages/Buyer/MyBookings";
import Wishlist from "./pages/Buyer/Wishlist";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import MyListings from "./pages/Seller/MyListings";
import CreateListing from "./pages/Seller/CreateListing";
import ListingsPage from "./pages/Listings/ListingsPage";
import ListingDetails from "./pages/Listings/ListingDetails";
import CreateBooking from "./pages/Listings/CreateBooking";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import WelcomePage from "./pages/Home/WelcomePage";
import Verification from "./pages/Verification/Verification"; // Updated import path
import BookingDetails from "./pages/Buyer/BookingDetails";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeComplete, setWelcomeComplete] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome page before
    const hasSeenWelcome = sessionStorage.getItem("hasSeenWelcome");
    if (hasSeenWelcome) {
      setShowWelcome(false);
      setWelcomeComplete(true);
    }
  }, []);

  const handleWelcomeComplete = () => {
    sessionStorage.setItem("hasSeenWelcome", "true");
    setWelcomeComplete(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && !welcomeComplete && (
          <WelcomePage onComplete={handleWelcomeComplete} />
        )}
      </AnimatePresence>

      {welcomeComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <Toaster position="top-right" />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/listings" element={<ListingsPage />} />
                  <Route path="/listings/:id" element={<ListingDetails />} />

                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["buyer"]}>
                        <BuyerDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-bookings"
                    element={
                      <ProtectedRoute allowedRoles={["buyer"]}>
                        <MyBookings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/verification"
                    element={
                      <ProtectedRoute allowedRoles={["buyer", "seller"]}>
                        <Verification />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/wishlist"
                    element={
                      <ProtectedRoute allowedRoles={["buyer"]}>
                        <Wishlist />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/booking/:bookingId"
                    element={
                      <ProtectedRoute allowedRoles={["buyer"]}>
                        <BookingDetails />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/listings/:listingId/book"
                    element={
                      <ProtectedRoute allowedRoles={["buyer"]}>
                        <CreateBooking />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["seller"]}>
                        <ErrorBoundary>
                          <SellerDashboard />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/seller/listings"
                    element={
                      <ProtectedRoute allowedRoles={["seller"]}>
                        <MyListings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/seller/create-listing"
                    element={
                      <ProtectedRoute allowedRoles={["seller"]}>
                        <CreateListing />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </motion.div>
      )}
    </>
  );
}

export default App;
