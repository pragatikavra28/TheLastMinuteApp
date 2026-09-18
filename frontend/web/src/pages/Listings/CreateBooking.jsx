import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useListingStore } from "../../store/listing.store";
import { useBookingStore } from "../../store/booking.store";
import { 
  Calendar, Users, ChevronLeft, Info, AlertCircle,
  Ticket, MapPin, Clock, Music, Film, Home,
  Shield, CheckCircle, Upload, CreditCard, Lock
} from "lucide-react";
import toast from "react-hot-toast";
import { bookingClient, verificationClient, paymentClient } from "../../api/clients";

// Payment Form Component
const PaymentForm = ({ amount, bookingId, onSuccess, onCancel }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setProcessing(true);
    setError(null);

    try {
      const response = await paymentClient.post('/create', {
        bookingId: bookingId,
        amount: amount,
        currency: 'inr'
      });

      if (response.data.success) {
        toast.success("Payment successful! Booking confirmed.");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
        <div className="flex items-center mb-3">
          <CreditCard className="w-5 h-5 text-purple-400 mr-2" />
          <span className="text-sm font-medium text-gray-300">Payment Details</span>
        </div>
        <div className="border border-gray-600 rounded-xl bg-gray-800 p-4 text-center">
          <p className="text-gray-400">💳 Test Payment Mode</p>
          <p className="text-xs text-gray-500 mt-2">Click "Pay ₹{amount.toFixed(2)}" to complete payment</p>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-700 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={processing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 flex items-center justify-center"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay ₹{amount.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Main CreateBooking Component
const CreateBooking = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentListing, fetchListing, isLoading: listingLoading } = useListingStore();
  const { createBooking, calculatePrice, isLoading: bookingLoading } = useBookingStore();

  // Booking state
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [priceBreakdown, setPriceBreakdown] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [capacityInfo, setCapacityInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    if (listingId) {
      fetchListing(listingId);
      checkVerification();
    }
  }, [listingId]);

  useEffect(() => {
    if (currentListing) {
      checkAvailabilityAndPrice();
    }
  }, [currentListing, numberOfTickets, checkInDate, checkOutDate]);

  const checkVerification = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await verificationClient.get("/documents");
        setIsUserVerified(response.data?.data?.length > 0);
      }
    } catch (error) {
      console.error("Verification check error:", error);
    }
  };

  const checkAvailabilityAndPrice = async () => {
    try {
      const category = currentListing?.category_name?.toLowerCase();
      
      // For hotels, use selected dates
      let startDate, endDate;
      
      if (category === 'hotel') {
        if (!checkInDate || !checkOutDate) {
          return;
        }
        startDate = checkInDate;
        endDate = checkOutDate;
      } else {
        // For movies/concerts, use today's date
        startDate = new Date().toISOString().split('T')[0];
        endDate = startDate;
      }
      
      const response = await bookingClient.get("/bookings/check-availability", {
        params: { listingId, startDate, endDate }
      });
      
      if (response.data.success) {
        setIsAvailable(response.data.data.available);
        setCapacityInfo(response.data.data);
      }

      if (response.data.data.available) {
        const price = await calculatePrice(parseInt(listingId), {
          startDate: startDate,
          endDate: endDate,
          guests: numberOfTickets
        });
        if (price) {
          setPriceBreakdown(price);
        }
      }
    } catch (error) {
      console.error("Availability check error:", error);
    }
  };

  const handleCreateBooking = async () => {
    if (!isAvailable) {
      toast.error("No slots available");
      return;
    }

    setLoading(true);
    try {
      const category = currentListing?.category_name?.toLowerCase();
      
      let startDate, endDate;
      
      if (category === 'hotel') {
        if (!checkInDate || !checkOutDate) {
          toast.error("Please select check-in and check-out dates");
          setLoading(false);
          return;
        }
        startDate = checkInDate;
        endDate = checkOutDate;
      } else {
        startDate = new Date().toISOString().split('T')[0];
        endDate = startDate;
      }
      
      const bookingPayload = {
        listingId: parseInt(listingId),
        startDate: startDate,
        endDate: endDate,
        numberOfGuests: numberOfTickets,
        totalPrice: priceBreakdown?.totalPrice
      };

      const result = await createBooking(bookingPayload);

      if (result.success && result.data) {
        setCreatedBookingId(result.data.id);
        setShowPayment(true);
        toast.success("Booking created! Please complete payment.");
      } else {
        toast.error(result.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! Your booking is confirmed.");
    setTimeout(() => {
      navigate("/my-bookings");
    }, 2000);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    toast.info("Payment cancelled. You can try again later.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to book");
      navigate("/login");
      return;
    }

    if (!isUserVerified) {
      toast.error("Please verify your identity first");
      navigate("/verification");
      return;
    }

    if (!isAvailable) {
      toast.error("No slots available");
      return;
    }

    const category = currentListing?.category_name?.toLowerCase();
    
    if (category === 'hotel' && (!checkInDate || !checkOutDate)) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    await handleCreateBooking();
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
          <h2 className="text-2xl font-bold text-white mb-4">Listing not found</h2>
          <Link to="/listings" className="text-purple-400">Back to Listings</Link>
        </div>
      </div>
    );
  }

  const category = currentListing.category_name?.toLowerCase();
  const fixedDate = currentListing?.show_date;
  const fixedTime = currentListing?.show_time;
  const maxTickets = currentListing.total_seats || 100;
  const today = new Date().toISOString().split('T')[0];

  const formatDate = (dateString) => {
    if (!dateString) return "Date to be announced";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  // Calculate minimum check-out date (day after check-in)
  const getMinCheckOutDate = () => {
    if (!checkInDate) return today;
    const date = new Date(checkInDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
  };

  // Calculate number of nights for hotel
  const getNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link to={`/listings/${listingId}`} className="inline-flex items-center text-gray-400 hover:text-purple-400">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Link>
        </div>

        <div className="bg-gray-800/80 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-purple-700 to-pink-700 px-8 py-6">
            <h1 className="text-2xl font-bold text-white mb-2">Complete Your Booking</h1>
            <p className="text-purple-200">{currentListing.title}</p>
          </div>

          <div className="px-8 py-4 border-b border-gray-700 bg-gray-800/50">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-400">Price per {category === 'hotel' ? 'night' : 'ticket'}</span>
                <p className="text-2xl font-bold text-white">₹{currentListing.price}</p>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-400">Location</span>
                <p className="font-medium text-gray-300">{currentListing.city || currentListing.location || "TBD"}</p>
              </div>
            </div>
          </div>

          {/* Verification Banner */}
          {!isUserVerified && (
            <div className="mx-8 mt-6 p-4 bg-yellow-900/50 border border-yellow-700 rounded-xl">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-400 font-medium">Verification Required</p>
                  <p className="text-sm text-yellow-300 mt-1">Please verify your identity before booking.</p>
                  <button onClick={() => navigate("/verification")} className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700">
                    <Upload className="w-4 h-4 mr-2 inline" /> Verify Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Booking Form */}
          {isUserVerified && !showPayment && (
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              
              {/* HOTEL BOOKING - With Date Selection */}
              {category === 'hotel' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Check-in Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                        <input
                          type="date"
                          value={checkInDate}
                          onChange={(e) => setCheckInDate(e.target.value)}
                          min={today}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Check-out Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                        <input
                          type="date"
                          value={checkOutDate}
                          onChange={(e) => setCheckOutDate(e.target.value)}
                          min={getMinCheckOutDate()}
                          disabled={!checkInDate}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white disabled:bg-gray-800 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>

                  {checkInDate && checkOutDate && getNights() > 0 && (
                    <div className="bg-purple-900/20 p-3 rounded-lg">
                      <p className="text-purple-300 text-sm">
                        📅 {getNights()} {getNights() === 1 ? 'night' : 'nights'} stay
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Guests <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input
                        type="number"
                        value={numberOfTickets}
                        onChange={(e) => setNumberOfTickets(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max={currentListing.max_guests || 10}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Maximum {currentListing.max_guests || 10} guests allowed</p>
                  </div>
                </>
              )}

              {/* MOVIE BOOKING - Fixed Date/Time */}
              {category === 'movie' && (
                <>
                  <div className="bg-purple-900/30 p-4 rounded-xl border border-purple-700">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Show Date (Fixed)</p>
                        <p className="font-semibold text-white text-lg">{formatDate(fixedDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/30 p-4 rounded-xl border border-purple-700">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Show Time (Fixed)</p>
                        <p className="font-semibold text-white text-lg">{fixedTime || "Time TBD"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-900/20 p-4 rounded-xl">
                    <div className="flex items-start">
                      <Film className="w-5 h-5 text-purple-400 mr-2" />
                      <div>
                        <p className="text-sm text-purple-300">Duration: {currentListing.duration || 120} minutes</p>
                        <p className="text-sm text-purple-300">Venue: {currentListing.venue || currentListing.location || "TBD"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Tickets <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                      <input
                        type="number"
                        value={numberOfTickets}
                        onChange={(e) => setNumberOfTickets(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max={maxTickets}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Maximum {maxTickets} tickets available</p>
                  </div>
                </>
              )}

              {/* CONCERT BOOKING - Fixed Date/Time */}
              {category === 'concert' && (
                <>
                  <div className="bg-pink-900/30 p-4 rounded-xl border border-pink-700">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-pink-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Concert Date (Fixed)</p>
                        <p className="font-semibold text-white text-lg">{formatDate(fixedDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-900/30 p-4 rounded-xl border border-pink-700">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-pink-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-400">Show Time (Fixed)</p>
                        <p className="font-semibold text-white text-lg">{fixedTime || "Time TBD"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-pink-900/20 p-4 rounded-xl">
                    <div className="flex items-start">
                      <Music className="w-5 h-5 text-pink-400 mr-2" />
                      <div>
                        <p className="text-sm text-pink-300">Duration: {currentListing.duration || 180} minutes</p>
                        <p className="text-sm text-pink-300">Venue: {currentListing.venue || currentListing.location || "TBD"}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Number of Tickets <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Ticket className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400 w-5 h-5" />
                      <input
                        type="number"
                        value={numberOfTickets}
                        onChange={(e) => setNumberOfTickets(Math.max(1, parseInt(e.target.value) || 1))}
                        min="1"
                        max={maxTickets}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
                      />
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Maximum {maxTickets} tickets available</p>
                  </div>
                </>
              )}

              {/* Capacity Info */}
              {capacityInfo && (
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Available Slots:</span>
                    <span className="text-white font-medium">{capacityInfo.remainingCapacity} / {capacityInfo.maxCapacity}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                      style={{ width: `${((capacityInfo.maxCapacity - capacityInfo.remainingCapacity) / capacityInfo.maxCapacity) * 100}%` }} />
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              {priceBreakdown && (
                <div className="bg-gray-700/50 p-6 rounded-xl">
                  <h3 className="font-bold text-lg text-white mb-4">Price Breakdown</h3>
                  <div className="space-y-3">
                    {category === 'hotel' && (
                      <div className="flex justify-between text-gray-300">
                        <span>₹{currentListing.price} × {getNights()} {getNights() === 1 ? 'night' : 'nights'}</span>
                        <span>₹{(currentListing.price * getNights()).toFixed(2)}</span>
                      </div>
                    )}
                    {category !== 'hotel' && (
                      <div className="flex justify-between text-gray-300">
                        <span>Ticket Price (₹{currentListing.price} × {numberOfTickets})</span>
                        <span>₹{(currentListing.price * numberOfTickets).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-300">
                      <span>Platform Fee (10%)</span>
                      <span>₹{priceBreakdown.commission?.toFixed(2) || 0}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-3 mt-3">
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span className="text-white">Total</span>
                        <span className="text-purple-400">₹{priceBreakdown.totalPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading || bookingLoading || !isAvailable} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition">
                {loading || bookingLoading ? "Creating Booking..." : "Proceed to Payment"}
              </button>

              <p className="text-xs text-gray-500 text-center">
                {category === 'hotel' 
                  ? "Check-in and check-out dates can be selected as per your preference."
                  : "Date and time are fixed by the seller and cannot be changed."}
              </p>
            </form>
          )}

          {/* Payment Section */}
          {showPayment && createdBookingId && priceBreakdown && (
            <div className="p-8">
              <div className="bg-green-900/30 border border-green-700 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <p className="text-green-400">Booking created! Complete payment to confirm.</p>
                </div>
              </div>
              
              <div className="bg-gray-700/50 p-6 rounded-xl mb-6">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-300">Booking ID:</span>
                  <span className="text-white font-mono">#{createdBookingId}</span>
                </div>
                <div className="flex justify-between text-lg mt-2">
                  <span className="text-gray-300">Total Amount:</span>
                  <span className="font-bold text-purple-400">₹{priceBreakdown.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <PaymentForm 
                amount={priceBreakdown.totalPrice}
                bookingId={createdBookingId}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateBooking;