import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useListingStore } from "../../store/listing.store";
import { useAuthStore } from "../../store/auth.store";
import { useBookingStore } from "../../store/booking.store";
import { 
  MapPin, Star, Calendar, Users, Home, ChevronLeft, Heart, 
  Clock, Shield, Wifi, Coffee, Car, Dumbbell, Waves, Snowflake,
  Check, X, Info, Share2, Phone, Mail, Ticket, Film, Music,
  Utensils, Hotel, Armchair, Tag, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { bookingClient } from "../../api/clients";

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentListing, fetchListing, isLoading: listingLoading } = useListingStore();
  const { wishlist, addToWishlist, removeFromWishlist, fetchWishlist, isLoading: wishlistLoading } = useBookingStore();
  const [isWishlistToggling, setIsWishlistToggling] = useState(false);
  const [realTimeAvailability, setRealTimeAvailability] = useState({
    available: true,
    maxCapacity: 0,
    totalBooked: 0,
    remainingCapacity: 0,
    loading: true
  });
  const [activeImage, setActiveImage] = useState(0);
  const [seatCategories, setSeatCategories] = useState([]);

  useEffect(() => {
    fetchListing(id);
    if (user) {
      fetchWishlist();
    }
  }, [id, user]);

  useEffect(() => {
    if (id) {
      checkRealTimeAvailability();
    }
    // Load seat categories from listing details
    if (currentListing?.details?.seat_categories) {
      setSeatCategories(currentListing.details.seat_categories);
    }
  }, [id, currentListing]);

  const checkRealTimeAvailability = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      // Use seller's fixed date if available
      const showDate = currentListing?.details?.show_date || currentListing?.startDate || today;
      
      const response = await bookingClient.get("/bookings/check-availability", {
        params: { 
          listingId: parseInt(id), 
          startDate: showDate, 
          endDate: showDate 
        }
      });
      
      if (response.data.success) {
        setRealTimeAvailability({
          available: response.data.data.available,
          maxCapacity: response.data.data.maxCapacity,
          totalBooked: response.data.data.totalBooked,
          remainingCapacity: response.data.data.remainingCapacity,
          loading: false
        });
      }
    } catch (error) {
      console.error("Error checking real-time availability:", error);
      setRealTimeAvailability(prev => ({ ...prev, loading: false }));
    }
  };

  const handleBookNow = () => {
    if (!user) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }
    
    if (!realTimeAvailability.available) {
      toast.error("This listing is currently fully booked");
      return;
    }
    
    navigate(`/listings/${id}/book`);
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error("Please login to add to wishlist");
      navigate("/login");
      return;
    }
    
    if (isWishlistToggling) return;
    
    setIsWishlistToggling(true);
    
    try {
      const listingId = parseInt(id);
      const isInWishlist = wishlist.some(item => {
        const itemId = item.id || item.listing_id;
        return parseInt(itemId) === listingId;
      });
      
      let result;
      if (isInWishlist) {
        result = await removeFromWishlist(id);
      } else {
        result = await addToWishlist(id);
      }
      
      if (result?.success) {
        await fetchWishlist();
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsWishlistToggling(false);
    }
  };

  const shareListing = () => {
    if (navigator.share) {
      navigator.share({
        title: currentListing.title,
        text: currentListing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

const formatDate = (dateString) => {
  if (!dateString) return "Date TBD";
  return new Date(dateString).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

  if (listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentListing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
          <Link to="/listings" className="text-purple-600 hover:text-purple-700">Back to Listings</Link>
        </div>
      </div>
    );
  }

  const listingId = parseInt(id);
  const isInWishlist = wishlist.some(item => {
    const itemId = item.id || item.listing_id;
    return parseInt(itemId) === listingId;
  });
  
  const isOwner = user?.id === currentListing.owner_id;
  const isActuallyAvailable = realTimeAvailability.loading 
    ? currentListing.availability 
    : realTimeAvailability.available;
  const category = currentListing.category_name?.toLowerCase();

  const amenities = currentListing.amenities || [];
  const amenityIcons = {
    'WiFi': Wifi,
    'Pool': Waves,
    'Parking': Car,
    'Gym': Dumbbell,
    'AC': Snowflake,
    'Coffee': Coffee,
    'Kitchen': Coffee,
  };

  // Get seller's fixed details
  const fixedDate = currentListing?.details?.show_date || currentListing?.startDate;
  const fixedTime = currentListing?.details?.show_time || currentListing?.showTime;
  const venue = currentListing?.details?.venue || currentListing?.venue || currentListing?.location;
  const duration = currentListing?.details?.duration || currentListing?.duration;
  const genre = currentListing?.details?.genre;
  const language = currentListing?.details?.language;
  const artist = currentListing?.details?.artist;
  const certification = currentListing?.details?.certification;
  const ageRestriction = currentListing?.details?.age_restriction;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/listings" className="inline-flex items-center text-gray-400 hover:text-purple-400 transition">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Listings
          </Link>
        </div>

        {/* Main Content */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Image Gallery */}
          <div className="relative h-96 bg-gradient-to-br from-purple-700 to-pink-700">
            <div className="absolute inset-0 bg-black/30 z-10"></div>
            {currentListing.images && currentListing.images.length > 0 ? (
              <>
                <img src={currentListing.images[activeImage]} alt={currentListing.title} className="w-full h-full object-cover" />
                {currentListing.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {currentListing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImage(index)}
                        className={`w-2 h-2 rounded-full transition ${activeImage === index ? 'bg-white w-6' : 'bg-white/50'}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                {category === 'hotel' && '🏨'}
                {category === 'restaurant' && '🍽️'}
                {category === 'movie' && '🎬'}
                {category === 'concert' && '🎤'}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-6 right-6 flex gap-3 z-20">
              <button
                onClick={shareListing}
                className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-gray-700 transition"
              >
                <Share2 className="w-5 h-5 text-gray-300" />
              </button>
              {user && user.role === 'buyer' && !isOwner && (
                <button
                  onClick={handleWishlist}
                  disabled={isWishlistToggling || wishlistLoading}
                  className={`p-3 rounded-full shadow-lg transition transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isInWishlist 
                      ? 'bg-pink-600 text-white hover:bg-pink-700' 
                      : 'bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:bg-pink-600 hover:text-white'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>

          <div className="p-8">
            {/* Title and Price */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-white mb-2">{currentListing.title}</h1>
                <div className="flex flex-wrap items-center gap-3 text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-purple-400" />
                    {venue || currentListing.city || currentListing.location || "Location TBD"}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span>{currentListing.avg_rating ? Number(currentListing.avg_rating).toFixed(1) : "New"}</span>
                    <span className="ml-1 text-gray-500">({currentListing.review_count || 0} reviews)</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-purple-400 mr-1" />
                    <span className="capitalize">{category}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">₹{currentListing.price}</p>
                <p className="text-gray-500">per person/ticket</p>
              </div>
            </div>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
  <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
    <Calendar className="w-5 h-5 text-purple-400 mr-3" />
    <div>
      <p className="text-xs text-gray-400">
        {category === 'movie' ? 'Show Date' : category === 'concert' ? 'Event Date' : 'Availability'}
      </p>
      <p className="font-semibold text-white">
        {(category === 'movie' || category === 'concert') 
          ? formatDate(currentListing?.details?.show_date || currentListing?.start_date)
          : realTimeAvailability.loading 
            ? "Checking..." 
            : isActuallyAvailable 
              ? "Available Now" 
              : "Fully Booked"}
      </p>
    </div>
  </div>
  
  {(category === 'movie' || category === 'concert') && (
    <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
      <Clock className="w-5 h-5 text-purple-400 mr-3" />
      <div>
        <p className="text-xs text-gray-400">
          {category === 'movie' ? 'Show Time' : 'Event Time'}
        </p>
        <p className="font-semibold text-white">
          {currentListing?.details?.show_time || currentListing?.show_time || "Time TBD"}
        </p>
      </div>
    </div>
  )}
              {(category === 'movie' || category === 'concert') && (
                <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                  <Clock className="w-5 h-5 text-purple-400 mr-3" />
                  <div>
                    <p className="text-xs text-gray-400">
                      {category === 'movie' ? 'Show Time' : 'Event Time'}
                    </p>
                    <p className="font-semibold text-white">{fixedTime || "Time TBD"}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Users className="w-5 h-5 text-purple-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-400">
                    {category === 'movie' || category === 'concert' ? 'Total Capacity' : 'Max Guests'}
                  </p>
                  <p className="font-semibold text-white">
                    {currentListing.total_seats || currentListing.max_guests || "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-700/50 rounded-xl">
                <Ticket className="w-5 h-5 text-purple-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-400">Available Now</p>
                  <p className="font-semibold text-white">
                    {realTimeAvailability.loading 
                      ? "Checking..." 
                      : `${realTimeAvailability.remainingCapacity} tickets left`}
                  </p>
                </div>
              </div>
            </div>

            {/* Capacity Progress Bar */}
            {!realTimeAvailability.loading && realTimeAvailability.maxCapacity > 0 && (
              <div className="mb-8">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Booking Progress</span>
                  <span className="text-white font-medium">
                    {Math.round((realTimeAvailability.totalBooked / realTimeAvailability.maxCapacity) * 100)}% Booked
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${(realTimeAvailability.totalBooked / realTimeAvailability.maxCapacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {realTimeAvailability.remainingCapacity} out of {realTimeAvailability.maxCapacity} tickets remaining
                </p>
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">About this {category}</h2>
              <p className="text-gray-400 leading-relaxed">{currentListing.description}</p>
            </div>

            {/* MOVIE SPECIFIC DETAILS - FIXED BY SELLER */}
            {category === 'movie' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Film className="w-5 h-5 mr-2 text-purple-400" />
                  Movie Details (Fixed by Seller)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <p className="text-sm text-purple-400">Venue / Cinema</p>
                    <p className="text-white font-semibold">{venue || "TBD"}</p>
                  </div>
                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <p className="text-sm text-purple-400">Duration</p>
                    <p className="text-white font-semibold">{duration || 120} minutes</p>
                  </div>
                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <p className="text-sm text-purple-400">Genre</p>
                    <p className="text-white font-semibold">{genre || "Not specified"}</p>
                  </div>
                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <p className="text-sm text-purple-400">Language</p>
                    <p className="text-white font-semibold">{language || "Not specified"}</p>
                  </div>
                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <p className="text-sm text-purple-400">Certification</p>
                    <p className="text-white font-semibold">{certification || "U/A"}</p>
                  </div>
                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <p className="text-sm text-purple-400">Show Date</p>
                    <p className="text-white font-semibold">{formatDate(fixedDate)}</p>
                  </div>
                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <p className="text-sm text-purple-400">Show Time</p>
                    <p className="text-white font-semibold">{fixedTime || "Time TBD"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CONCERT SPECIFIC DETAILS - FIXED BY SELLER */}
            {category === 'concert' && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Music className="w-5 h-5 mr-2 text-pink-400" />
                  Concert Details (Fixed by Seller)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <p className="text-sm text-pink-400">Venue</p>
                    <p className="text-white font-semibold">{venue || "TBD"}</p>
                  </div>
                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <p className="text-sm text-pink-400">Duration</p>
                    <p className="text-white font-semibold">{duration || 180} minutes</p>
                  </div>
                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <p className="text-sm text-pink-400">Artist/Band</p>
                    <p className="text-white font-semibold">{artist || "Not specified"}</p>
                  </div>
                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <p className="text-sm text-pink-400">Genre</p>
                    <p className="text-white font-semibold">{genre || "Not specified"}</p>
                  </div>
                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <p className="text-sm text-pink-400">Age Restriction</p>
                    <p className="text-white font-semibold">{ageRestriction || 18}+ years</p>
                  </div>
                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <p className="text-sm text-pink-400">Event Date</p>
                    <p className="text-white font-semibold">{formatDate(fixedDate)}</p>
                  </div>
                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <p className="text-sm text-pink-400">Event Time</p>
                    <p className="text-white font-semibold">{fixedTime || "Time TBD"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* SEAT/ZONE CATEGORIES - SHOW WHAT SELLER HAS SET */}
            {(category === 'movie' || category === 'concert') && seatCategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Armchair className="w-5 h-5 mr-2 text-purple-400" />
                  {category === 'movie' ? 'Seat Categories' : 'Zone Categories'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seatCategories.map((cat, idx) => (
                    <div key={idx} className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">{cat.name}</h3>
                        <span className="text-xs text-purple-400">{cat.price_multiplier}x Price</span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        {category === 'movie' ? 'Seats' : 'Capacity'}: {cat.available_seats}
                      </p>
                      <p className="text-xs text-gray-500">
                        Price: ₹{(currentListing.price * cat.price_multiplier).toFixed(2)} per ticket
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {amenities.map((amenity, index) => {
                    const Icon = amenityIcons[amenity] || Check;
                    return (
                      <div key={index} className="flex items-center p-3 bg-gray-700/50 rounded-lg">
                        <Icon className="w-5 h-5 text-purple-400 mr-2" />
                        <span className="text-gray-300">{amenity}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Important Info for Movies/Concerts */}
            {(category === 'movie' || category === 'concert') && (
              <div className="mb-8 p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-400">Important Information</h4>
                    <p className="text-sm text-yellow-300 mt-1">
                      • Date and time are fixed by the seller and cannot be changed
                    </p>
                    <p className="text-sm text-yellow-300">
                      • Please arrive at least 30 minutes before the scheduled time
                    </p>
                    <p className="text-sm text-yellow-300">
                      • Valid ID proof is required for entry
                    </p>
                    {category === 'concert' && ageRestriction && (
                      <p className="text-sm text-yellow-300">
                        • Age restriction: {ageRestriction}+ years only
                      </p>
                    )}
                    {category === 'movie' && certification && (
                      <p className="text-sm text-yellow-300">
                        • Certification: {certification} {certification === 'A' && '- Adult only'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Host Info */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {currentListing.owner_name?.charAt(0).toUpperCase() || 'H'}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Hosted by {currentListing.owner_name || 'Professional Host'}</h3>
                  <div className="flex items-center mt-2 gap-4">
                    <div className="flex items-center text-sm text-gray-400">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span>{currentListing.avg_rating ? Number(currentListing.avg_rating).toFixed(1) : "New"} · {currentListing.review_count || 0} reviews</span>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-purple-400 hover:bg-gray-600 transition">
                      <Mail className="w-4 h-4" />
                      Contact Host
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg text-purple-400 hover:bg-gray-600 transition">
                      <Phone className="w-4 h-4" />
                      Call Host
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!user ? (
              <Link
                to="/login"
                className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-lg"
              >
                Login to Book
              </Link>
            ) : isOwner ? (
              <div className="bg-purple-900/30 p-4 rounded-xl border border-purple-700">
                <p className="text-purple-400">This is your listing. You cannot book your own property.</p>
              </div>
            ) : user.role === 'buyer' && isActuallyAvailable ? (
              <button
                onClick={handleBookNow}
                disabled={realTimeAvailability.loading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition transform hover:-translate-y-1 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {realTimeAvailability.loading ? "Checking availability..." : "Book Now"}
              </button>
            ) : user.role === 'buyer' && !isActuallyAvailable ? (
              <div className="bg-red-900/30 p-4 rounded-xl border border-red-700">
                <p className="text-red-400">This listing is currently fully booked and not available for booking.</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetails;