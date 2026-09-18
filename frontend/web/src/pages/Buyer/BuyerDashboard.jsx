import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useBookingStore } from "../../store/booking.store";
import { 
  Calendar, 
  Heart, 
  Clock, 
  DollarSign, 
  Star,
  MapPin,
  ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";

const BuyerDashboard = () => {
  const { user } = useAuthStore();
  const { 
    bookings, 
    buyerStats, 
    wishlist,
    fetchUserBookings, 
    fetchBuyerStats,
    fetchWishlist,
    isLoading 
  } = useBookingStore();
  
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLocalError(null);
        await Promise.all([
          fetchUserBookings(),
          fetchBuyerStats(),
          fetchWishlist()
        ]);
      } catch (error) {
        console.error("Error loading buyer dashboard:", error);
        setLocalError("Failed to load some data. Please refresh the page.");
        toast.error("Failed to load dashboard data");
      }
    };
    loadData();
  }, []);

  // Safe number formatting functions
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹0.00';
    const num = Number(value);
    return isNaN(num) ? '₹0.00' : `₹${num.toFixed(2)}`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Safe data access with fallbacks
  const stats = {
    total_bookings: formatNumber(buyerStats?.stats?.total_bookings),
    total_spent: buyerStats?.stats?.total_spent, // Keep original for formatting
    active_bookings: formatNumber(buyerStats?.stats?.active_bookings),
    completed_bookings: formatNumber(buyerStats?.stats?.completed_bookings),
    cancelled_bookings: formatNumber(buyerStats?.stats?.cancelled_bookings),
    pending_bookings: formatNumber(buyerStats?.stats?.pending_bookings)
  };

  const statCards = [
    {
      label: "Total Bookings",
      value: stats.total_bookings,
      icon: Calendar,
      bg: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Total Spent",
      value: formatCurrency(stats.total_spent),
      icon: DollarSign,
      bg: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      label: "Active Bookings",
      value: stats.active_bookings,
      icon: Clock,
      bg: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      label: "Completed",
      value: stats.completed_bookings,
      icon: Star,
      bg: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ];

  const upcomingBookings = Array.isArray(buyerStats?.upcomingBookings) ? buyerStats.upcomingBookings : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];

  if (localError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{localError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || 'Buyer'}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your bookings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} w-14 h-14 rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-7 h-7 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            to="/listings"
            className="group bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white hover:from-blue-700 hover:to-indigo-700 transition transform hover:-translate-y-1 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Browse Listings</h3>
                <p className="text-blue-100">Find amazing last-minute deals</p>
              </div>
              <ChevronRight className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 transition" />
            </div>
          </Link>

          <Link
            to="/my-bookings"
            className="group bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white hover:from-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">My Bookings</h3>
                <p className="text-purple-100">View and manage your bookings</p>
              </div>
              <ChevronRight className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 transition" />
            </div>
          </Link>

          <Link
            to="/wishlist"
            className="group bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white hover:from-pink-600 hover:to-rose-600 transition transform hover:-translate-y-1 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Wishlist</h3>
                <p className="text-pink-100">{safeWishlist.length} saved items</p>
              </div>
              <Heart className="w-8 h-8 text-white opacity-50 group-hover:opacity-100 transition" />
            </div>
          </Link>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
              <Link
                to="/my-bookings"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {upcomingBookings.length > 0 ? (
              upcomingBookings.slice(0, 3).map((booking, index) => (
                <Link
                  key={booking?.id || index}
                  to={`/bookings/${booking?.id}`}
                  className="block p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 mb-1">
                        {booking?.title || 'Untitled Booking'}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {booking?.location || "Location TBD"}
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {booking?.start_date ? new Date(booking.start_date).toLocaleDateString() : 'Date TBD'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking?.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-700'
                            : booking?.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {booking?.status || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(booking?.total_price)}
                      </p>
                      <p className="text-sm text-gray-500">Total</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No upcoming bookings
                </h3>
                <p className="text-gray-500 mb-6">
                  Start exploring listings to make your first booking!
                </p>
                <Link
                  to="/listings"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
                >
                  Browse Listings
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;