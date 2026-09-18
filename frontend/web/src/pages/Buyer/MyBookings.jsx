import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookingStore } from "../../store/booking.store";
import { Calendar, MapPin, ChevronRight, XCircle, Eye, Download, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { bookings, fetchUserBookings, cancelBooking, isLoading } = useBookingStore();

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const result = await cancelBooking(bookingId);
    if (result?.success) {
      toast.success("Booking cancelled successfully");
    }
  };

  const getStatusColor = (status) => {
  switch(status) {
    case 'CONFIRMED': return 'bg-green-100 text-green-800';
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED': return 'bg-red-100 text-red-800';
    case 'COMPLETED': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            My <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Bookings</span>
          </h1>
          <p className="text-gray-600">Manage all your reservations and e-tickets</p>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition border border-purple-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Ticket className="w-5 h-5 text-purple-500" />
                            <h3 className="text-xl font-bold text-gray-900">{booking.title}</h3>
                            <span className="text-xs text-gray-400">#{booking.booking_reference || booking.id}</span>
                          </div>
                          <div className="flex items-center text-gray-500 text-sm mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.location || booking.city || "Location TBD"}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0 text-purple-500" />
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="font-medium text-sm">{formatDate(booking.start_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500">Guests / Tickets</p>
                            <p className="font-medium text-sm">{booking.number_of_guests}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <div>
                            <p className="text-xs text-gray-500">Total Amount</p>
                            <p className="font-bold text-purple-600">${parseFloat(booking.total_price).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Link 
                          to={`/booking/${booking.id}`} 
                          className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg font-medium text-sm transition"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Link>
                        
                        {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                          <button 
                            onClick={() => handleCancel(booking.id)} 
                            className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium text-sm transition"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Booking
                          </button>
                        )}

                        {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                          <Link
                            to={`/booking/${booking.id}`}
                            className="inline-flex items-center px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium text-sm transition"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Get E-Ticket
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl">
            <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Start exploring listings to make your first booking!</p>
            <Link to="/listings" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition">
              Browse Listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;