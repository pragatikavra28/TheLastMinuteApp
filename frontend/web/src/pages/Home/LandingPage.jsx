import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useListingStore } from "../../store/listing.store";
import { 
  Search, Calendar, Shield, Clock, Users, Hotel, Ticket, Utensils, Music,
  Star, MapPin, ChevronRight, Sparkles, Heart, Zap, Award, Globe, TrendingUp,
  ArrowRight, Play, Coffee, Sun, Moon, Camera, X, Gift, Percent, Tag
} from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";

const LandingPage = () => {
  const { user } = useAuthStore();
  const { listings, fetchCategories, searchListings } = useListingStore();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredListings, setFeaturedListings] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [showDealGif, setShowDealGif] = useState(true);
  
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    fetchCategories();
    searchListings({ sortBy: 'created_at DESC', limit: 6 });
  }, []);

  useEffect(() => {
    if (listings.length > 0) {
      setFeaturedListings(listings.slice(0, 6));
    }
  }, [listings]);

  // Animated background deal text
  const dealTexts = ["🔥 HOT DEAL", "⚡ FLASH SALE", "🎉 LAST MINUTE", "💸 SAVE 70%", "🎫 LIMITED OFFER", "🏷️ BEST PRICE", "✨ EXCLUSIVE", "🚀 INSTANT BOOK"];

  const categories = [
    { icon: Hotel, name: "Hotels", gradient: "from-purple-500 to-pink-500", lightBg: "bg-purple-50", count: "500+", slug: "hotel", description: "Luxury stays & cozy retreats", color: "purple" },
    { icon: Ticket, name: "Movies", gradient: "from-pink-500 to-rose-500", lightBg: "bg-pink-50", count: "200+", slug: "movie", description: "Latest blockbusters & classics", color: "pink" },
    { icon: Music, name: "Concerts", gradient: "from-purple-600 to-pink-600", lightBg: "bg-purple-50", count: "100+", slug: "concert", description: "Live music & epic performances", color: "purple" },
    { icon: Utensils, name: "Restaurants", gradient: "from-pink-500 to-purple-500", lightBg: "bg-pink-50", count: "300+", slug: "restaurant", description: "Fine dining & local favorites", color: "pink" },
  ];

  const features = [
    { icon: Zap, title: "Lightning Fast", description: "Book in under 60 seconds", color: "text-purple-400", bg: "bg-purple-900/30", stats: "2M+ bookings" },
    { icon: Shield, title: "Secure Payments", description: "Your transactions are protected", color: "text-pink-400", bg: "bg-pink-900/30", stats: "100% secure" },
    { icon: Heart, title: "Best Prices", description: "Price match guarantee", color: "text-rose-400", bg: "bg-rose-900/30", stats: "Save up to 50%" },
    { icon: Globe, title: "Global Reach", description: "Book anywhere, anytime", color: "text-purple-400", bg: "bg-purple-900/30", stats: "100+ cities" },
    { icon: Users, title: "Trusted Community", description: "Join millions of users", color: "text-pink-400", bg: "bg-pink-900/30", stats: "5M+ users" },
    { icon: Award, title: "Top Rated", description: "4.8/5 average rating", color: "text-amber-400", bg: "bg-amber-900/30", stats: "50K+ reviews" },
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Travel Blogger", image: "https://images.unsplash.com/photo-1494790108777-766fd34f5e7b?w=200", content: "LastMinute saved my vacation! Found an amazing hotel at 50% off just hours before check-in.", rating: 5, date: "2 days ago" },
    { name: "Michael Chen", role: "Food Critic", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200", content: "The restaurant booking system is incredible. Got a table at the most popular spot in town!", rating: 5, date: "1 week ago" },
    { name: "Emma Davis", role: "Concert Goer", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200", content: "Scored last-minute tickets to my favorite band. The seat selection feature is genius!", rating: 5, date: "3 days ago" },
  ];

  const destinations = [
    { name: "Paris", country: "France", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=500", count: 345, color: "from-purple-500/20 to-pink-500/20" },
    { name: "Tokyo", country: "Japan", image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=500", count: 289, color: "from-pink-500/20 to-purple-500/20" },
    { name: "New York", country: "USA", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=500", count: 567, color: "from-purple-500/20 to-pink-500/20" },
    { name: "Bali", country: "Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657dfaab6d0?w=500", count: 432, color: "from-pink-500/20 to-purple-500/20" },
    { name: "Rome", country: "Italy", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500", count: 298, color: "from-purple-500/20 to-pink-500/20" },
    { name: "Barcelona", country: "Spain", image: "https://images.unsplash.com/photo-1583429578889-30ad6e8f99e8?w=500", count: 376, color: "from-pink-500/20 to-purple-500/20" },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/listings');
    }
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/listings?category=${categorySlug}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Animated Background Deal Text */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {dealTexts.map((text, index) => (
          <motion.div
            key={index}
            className="absolute whitespace-nowrap text-6xl md:text-8xl font-bold text-white/5"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360
            }}
            animate={{
              x: [null, Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [null, Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              rotate: [null, Math.random() * 360, Math.random() * 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {text}
          </motion.div>
        ))}
      </div>

      {/* Floating Deal GIF - Bottom Right Corner */}
      <AnimatePresence>
        {showDealGif && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 cursor-pointer group"
            onClick={() => navigate("/listings?sortBy=price_low")}
          >
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition"></div>
              
              {/* GIF Container */}
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-1 shadow-2xl">
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  {/* Animated GIF - Replace with your actual GIF URL */}
                  <img 
                    src="https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif" 
                    alt="Great Deals"
                    className="w-32 h-32 object-cover"
                  />
                  {/* Overlay Text */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center pb-3">
                    <div className="flex items-center gap-1 text-white text-xs font-bold">
                      <Percent className="w-3 h-3" />
                      <span>70% OFF</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDealGif(false);
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
              
              {/* Pulse Animation */}
              <div className="absolute inset-0 rounded-2xl border-2 border-purple-400 animate-ping opacity-75"></div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-3 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition">
              🔥 Last Minute Deals!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section 
        style={{ y }}
        className="relative overflow-hidden pt-20 pb-32"
      >
        {/* Animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
              initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
              animate={{ y: [null, -50, 50, -50], x: [null, 30, -30, 30] }}
              transition={{ duration: Math.random() * 10 + 10, repeat: Infinity }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20"
            >
              <Sparkles className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm">Last Minute Deals • Save up to 70%</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="block">Last Minute Deals,</span>
              <span className="block bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent mt-2">
                Instant Happiness
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-gray-300 max-w-3xl mx-auto">
              Discover and book amazing hotels, movies, concerts, and restaurants at unbeatable last-minute prices
            </p>
            
            {!user && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <Link 
                  to="/register?role=buyer" 
                  className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-xl flex items-center justify-center"
                >
                  Start Booking
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </Link>
                <Link 
                  to="/register?role=seller" 
                  className="group bg-transparent border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-900 transition transform hover:-translate-y-1 flex items-center justify-center"
                >
                  Become a Seller
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                </Link>
              </motion.div>
            )}

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <form onSubmit={handleSearch} className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-2 flex flex-col md:flex-row border border-white/20">
                <div className="flex-1 p-2">
                  <div className="flex items-center">
                    <Search className="w-5 h-5 text-purple-400 ml-2" />
                    <input 
                      type="text" 
                      placeholder="Search for hotels, movies, concerts, restaurants..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 outline-none bg-transparent text-white placeholder-gray-400" 
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition m-2"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap gap-2 justify-center mt-4">
                <span className="text-gray-400 text-sm">Popular:</span>
                {["Miami Beach", "New York", "Los Angeles", "Las Vegas", "Paris", "Tokyo"].map((city) => (
                  <button
                    key={city}
                    onClick={() => navigate(`/listings?location=${city}`)}
                    className="text-sm text-gray-300 hover:text-white px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section - Dark Theme */}
      <section className="py-16 bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5M+", label: "Happy Customers", icon: Users, color: "from-purple-500 to-pink-500" },
              { value: "50K+", label: "Active Listings", icon: Hotel, color: "from-pink-500 to-purple-500" },
              { value: "100+", label: "Cities", icon: MapPin, color: "from-purple-500 to-pink-500" },
              { value: "24/7", label: "Support", icon: Clock, color: "from-pink-500 to-purple-500" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-4 group-hover:scale-110 transition shadow-lg`}>
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Dark Theme */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Explore <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Categories</span>
            </h2>
            <p className="text-xl text-gray-400">Find your perfect experience</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  <div className="relative bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden border border-white/10">
                    <div className={`bg-gradient-to-r ${category.gradient} h-40 flex items-center justify-center relative`}>
                      <IconComponent className="w-20 h-20 text-white opacity-80 group-hover:scale-110 transition-transform" />
                      <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-white font-bold text-sm">{category.count}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{category.description}</p>
                      <div className="flex items-center text-purple-400 font-medium group-hover:text-pink-400">
                        Explore Now
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings - Dark Theme */}
      {featuredListings.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex justify-between items-end mb-12"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  Featured <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Listings</span>
                </h2>
                <p className="text-xl text-gray-400">Hand-picked just for you</p>
              </div>
              <Link to="/listings" className="hidden md:flex items-center text-purple-400 font-semibold hover:gap-2 transition-all group">
                View All
                <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition" />
              </Link>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Link to={`/listings/${listing.id}`} className="block h-full">
                    <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden h-full flex flex-col border border-white/10">
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 z-10"></div>
                        {listing.images && listing.images[0] ? (
                          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-4xl text-white">
                              {listing.category_name === 'hotel' && '🏨'}
                              {listing.category_name === 'restaurant' && '🍽️'}
                              {listing.category_name === 'movie' && '🎬'}
                              {listing.category_name === 'concert' && '🎤'}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 z-20">
                          <span className="font-bold text-purple-400">${listing.price}</span>
                          <span className="text-gray-300 text-sm">/night</span>
                        </div>
                      </div>
                      <div className="p-5 flex-1">
                        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{listing.title}</h3>
                        <div className="flex items-center text-gray-400 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{listing.city || listing.location || "Location TBD"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium text-gray-300">
                              {listing.avg_rating ? Number(listing.avg_rating).toFixed(1) : "New"}
                            </span>
                            <span className="ml-1 text-sm text-gray-500">({listing.review_count || 0} reviews)</span>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            listing.availability ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {listing.availability ? 'Available' : 'Booked'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-xs rounded-full">
                            {listing.category_name || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Link to="/listings" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition">
                View All Listings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section - Dark Theme */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">LastMinute</span>
            </h2>
            <p className="text-xl text-gray-400">Experience the best booking platform</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <div className={`${feature.bg} p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/10`}>
                  <div className={`w-16 h-16 ${feature.bg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 mb-4">{feature.description}</p>
                  <div className="flex items-center text-sm font-semibold text-purple-400">
                    <span>{feature.stats}</span>
                    <ArrowRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Dark Theme */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              What Our <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Users Say</span>
            </h2>
            <p className="text-xl text-gray-400">Trusted by millions worldwide</p>
          </motion.div>

          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-2xl mx-auto border border-white/10">
                      <div className="flex items-center mb-6">
                        <img src={testimonial.image} alt={testimonial.name} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-purple-500" />
                        <div>
                          <h4 className="font-bold text-white">{testimonial.name}</h4>
                          <p className="text-sm text-gray-400">{testimonial.role}</p>
                          <div className="flex mt-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 italic">"{testimonial.content}"</p>
                      <p className="text-xs text-gray-500 mt-4">{testimonial.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all ${activeTestimonial === index ? 'w-6 bg-purple-500' : 'bg-purple-500/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark Theme */}
      <section className="py-20 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Save Big?</h2>
            <p className="text-xl text-purple-200 mb-10 max-w-2xl mx-auto">
              Join thousands of happy customers who've discovered amazing last-minute deals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register?role=buyer"
                className="bg-white text-purple-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition transform hover:-translate-y-1 shadow-xl"
              >
                Get Started Now
              </Link>
              <Link
                to="/listings"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-900 transition transform hover:-translate-y-1"
              >
                Browse Listings
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;