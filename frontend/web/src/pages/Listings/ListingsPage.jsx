import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useListingStore } from "../../store/listing.store";
import { Search, MapPin, Star, Filter, X, SlidersHorizontal, Grid3x3, List, Calendar, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ListingsPage = () => {
  const { listings, categories, filters, isLoading, fetchCategories, searchListings, setFilters, resetFilters } = useListingStore();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState("grid");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  useEffect(() => {
    fetchCategories();
    
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const locationParam = searchParams.get('location');
    
    const initialFilters = {};
    if (categoryParam) {
      initialFilters.category = categoryParam;
      setFilters({ category: categoryParam });
    }
    if (searchParam) {
      initialFilters.query = searchParam;
      setSearchQuery(searchParam);
      setFilters({ query: searchParam });
    }
    if (locationParam) {
      initialFilters.location = locationParam;
      setFilters({ location: locationParam });
    }
    
    searchListings(initialFilters);
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ query: searchQuery });
    searchListings({ query: searchQuery });
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const category = categories.find(c => c.id === parseInt(categoryId));
    const categoryName = category ? category.name : "";
    setFilters({ category: categoryName });
    searchListings({ category: categoryName });
  };

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: value };
    setPriceRange(newRange);
    const priceFilters = {};
    if (newRange.min) priceFilters.minPrice = newRange.min;
    if (newRange.max) priceFilters.maxPrice = newRange.max;
    setFilters(priceFilters);
    searchListings(priceFilters);
  };

  const clearFilters = () => {
    resetFilters();
    setSearchQuery("");
    setPriceRange({ min: "", max: "" });
    setShowFilters(false);
    searchListings();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date TBD";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            Find Amazing <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Deals</span>
          </h1>
          <p className="text-gray-400">Discover last-minute bookings at unbeatable prices</p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSearch}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-8 py-4 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition flex items-center justify-center"
            >
              <SlidersHorizontal className="w-5 h-5 mr-2" />
              Filters
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-4 rounded-xl border transition ${viewMode === "grid" ? "bg-purple-600 text-white border-purple-600" : "bg-gray-800/50 border-gray-700 text-gray-400"}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-4 rounded-xl border transition ${viewMode === "list" ? "bg-purple-600 text-white border-purple-600" : "bg-gray-800/50 border-gray-700 text-gray-400"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.form>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">Filters</h3>
                  <button onClick={clearFilters} className="text-gray-400 hover:text-purple-400 transition">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={categories.find(c => c.name === filters.category)?.id || ""}
                      onChange={handleCategoryChange}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Price (₹)</label>
                    <input
                      type="number"
                      placeholder="Any"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                      min="0"
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select
                      value={filters.sortBy || 'created_at DESC'}
                      onChange={(e) => {
                        setFilters({ sortBy: e.target.value });
                        searchListings({ sortBy: e.target.value });
                      }}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                    >
                      <option value="created_at DESC">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2 bg-purple-900/50 text-purple-300 rounded-lg hover:bg-purple-800/50 transition"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-400">
            Found <span className="font-bold text-purple-400">{listings.length}</span> listings
          </p>
        </div>

        {/* Listings Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : listings.length > 0 ? (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {listings.map((listing, index) => {
              const categoryName = listing.category_name?.toLowerCase();
              const showDate = listing.details?.show_date || listing.start_date;
              const showTime = listing.details?.show_time || listing.show_time;
              
              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={`/listings/${listing.id}`} className="block">
                    <div className={`bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden border border-gray-700 ${viewMode === "list" ? "flex" : ""}`}>
                      <div className={`relative ${viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "h-48"} overflow-hidden`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 z-10"></div>
                        {listing.images && listing.images[0] ? (
                          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <span className="text-4xl text-white">
                              {categoryName === 'hotel' && '🏨'}
                              {categoryName === 'restaurant' && '🍽️'}
                              {categoryName === 'movie' && '🎬'}
                              {categoryName === 'concert' && '🎤'}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1 z-20">
                          <span className="font-bold text-purple-400">₹{listing.price}</span>
                          <span className="text-gray-300 text-sm">
                            {categoryName === 'hotel' ? '/night' : '/ticket'}
                          </span>
                        </div>
                      </div>
                      <div className={`p-5 ${viewMode === "list" ? "flex-1" : ""}`}>
                        <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{listing.title}</h3>
                        
                        {/* Seller ki date aur time show karo cards pe bhi */}
                        {(categoryName === 'movie' || categoryName === 'concert') && (showDate || showTime) && (
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                            {showDate && (
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1 text-purple-400" />
                                <span>{formatDate(showDate)}</span>
                              </div>
                            )}
                            {showTime && (
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 text-purple-400" />
                                <span>{showTime}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
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
                            listing.availability ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-red-900/50 text-red-400 border border-red-700'
                          }`}>
                            {listing.availability ? 'Available' : 'Booked'}
                          </span>
                        </div>
                        <div className="mt-3">
                          <span className="inline-block px-2 py-1 bg-gradient-to-r from-purple-900/50 to-pink-900/50 text-purple-300 text-xs rounded-full">
                            {listing.category_name || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl">
            <Search className="w-16 h-16 text-purple-500/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No listings found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingsPage;