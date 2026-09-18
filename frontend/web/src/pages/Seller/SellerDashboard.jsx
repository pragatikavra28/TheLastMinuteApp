import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useListingStore } from "../../store/listing.store";
import { useAuthStore } from "../../store/auth.store";
import { 
  Home, DollarSign, Users, Star, Calendar, TrendingUp, 
  PlusCircle, Eye, BookOpen, CheckCircle, XCircle, Clock,
  TrendingDown, Activity, Award, Target, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

const SellerDashboard = () => {
  const { user } = useAuthStore();
  const { sellerStats, fetchSellerStats, sellerListings, fetchSellerListings, isLoading } = useListingStore();
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    fetchSellerStats();
    fetchSellerListings();
  }, []);

  // Sample data for charts (replace with real API data)
  const revenueData = [
    { name: "Mon", revenue: 12000, bookings: 8 },
    { name: "Tue", revenue: 19000, bookings: 12 },
    { name: "Wed", revenue: 15000, bookings: 10 },
    { name: "Thu", revenue: 25000, bookings: 18 },
    { name: "Fri", revenue: 35000, bookings: 25 },
    { name: "Sat", revenue: 45000, bookings: 32 },
    { name: "Sun", revenue: 38000, bookings: 28 },
  ];

  const categoryData = [
    { name: "Hotels", value: 35, color: "#8b5cf6" },
    { name: "Restaurants", value: 25, color: "#ec489a" },
    { name: "Movies", value: 20, color: "#06b6d4" },
    { name: "Concerts", value: 20, color: "#f59e0b" },
  ];

  const stats = [
    { 
      title: "Total Revenue", 
      value: `₹${sellerStats?.totalRevenue?.toFixed(2) || "0"}`, 
      icon: DollarSign, 
      trend: "+12%",
      trendUp: true,
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-500/10"
    },
    { 
      title: "Total Bookings", 
      value: sellerStats?.totalBookings || "0", 
      icon: BookOpen, 
      trend: "+8%",
      trendUp: true,
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-500/10"
    },
    { 
      title: "Active Listings", 
      value: sellerStats?.activeListings || "0", 
      icon: Eye, 
      trend: "+5%",
      trendUp: true,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-500/10"
    },
    { 
      title: "Avg Rating", 
      value: `${sellerStats?.avgRating?.toFixed(1) || "0"}★`, 
      icon: Star, 
      trend: "+0.2",
      trendUp: true,
      color: "from-yellow-500 to-orange-500",
      bg: "bg-yellow-500/10"
    },
    { 
      title: "Pending Bookings", 
      value: sellerStats?.pendingBookings || "0", 
      icon: Clock, 
      trend: "-3%",
      trendUp: false,
      color: "from-orange-500 to-red-500",
      bg: "bg-orange-500/10"
    },
    { 
      title: "Completion Rate", 
      value: `${sellerStats?.completionRate || "94"}%`, 
      icon: Target, 
      trend: "+2%",
      trendUp: true,
      color: "from-teal-500 to-green-500",
      bg: "bg-teal-500/10"
    },
  ];

  const recentBookings = [
    { id: 1, customer: "Rahul Sharma", listing: "Luxury Beach Resort", amount: "₹12,500", status: "confirmed", date: "2024-03-15" },
    { id: 2, customer: "Priya Patel", listing: "Italian Bistro", amount: "₹3,200", status: "pending", date: "2024-03-14" },
    { id: 3, customer: "Amit Kumar", listing: "Coldplay Concert", amount: "₹8,500", status: "confirmed", date: "2024-03-14" },
    { id: 4, customer: "Neha Singh", listing: "Avatar Movie", amount: "₹1,200", status: "completed", date: "2024-03-13" },
    { id: 5, customer: "Vikram Malhotra", listing: "Mountain View Hotel", amount: "₹15,000", status: "cancelled", date: "2024-03-12" },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400 border border-green-500';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border border-blue-500';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border border-red-500';
      default: return 'bg-gray-500/20 text-gray-400 border border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Seller <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-gray-400">Welcome back, {user?.name}! Here's your business overview.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className={`${stat.bg} rounded-2xl p-4 backdrop-blur-sm border border-white/10`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Revenue Overview
              </h3>
              <div className="flex gap-2">
                {["day", "week", "month"].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      timeRange === range 
                        ? "bg-purple-600 text-white" 
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [`₹${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700"
          >
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-pink-400" />
              Category Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Bookings Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Bookings
              </h3>
              <Link to="/seller/bookings" className="text-purple-400 hover:text-purple-300 text-sm transition">
                View All →
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Booking ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Listing</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">#{booking.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{booking.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{booking.listing}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-400">{booking.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{booking.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-purple-400 hover:text-purple-300 transition">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/seller/create-listing">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 border border-purple-500/30 text-center cursor-pointer"
            >
              <PlusCircle className="w-12 h-12 text-purple-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold">Create New Listing</h4>
              <p className="text-gray-400 text-sm mt-1">Add a new hotel, restaurant, movie, or concert</p>
            </motion.div>
          </Link>

          <Link to="/seller/listings">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-6 border border-blue-500/30 text-center cursor-pointer"
            >
              <Eye className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold">Manage Listings</h4>
              <p className="text-gray-400 text-sm mt-1">Edit, update, or remove your listings</p>
            </motion.div>
          </Link>

          <Link to="/seller/analytics">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl p-6 border border-green-500/30 text-center cursor-pointer"
            >
              <Award className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold">View Analytics</h4>
              <p className="text-gray-400 text-sm mt-1">Detailed insights and performance metrics</p>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;