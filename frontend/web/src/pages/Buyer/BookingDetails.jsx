import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useBookingStore } from "../../store/booking.store";
import { useAuthStore } from "../../store/auth.store";
import { 
  Calendar, 
  MapPin, 
  Ticket, 
  Users, 
  Clock, 
  Download, 
  Printer,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  Utensils,
  Film,
  Music,
  QrCode
} from "lucide-react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchBooking, currentBooking, isLoading } = useBookingStore();
  const ticketRef = useRef(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking(bookingId);
    }
  }, [bookingId]);

  // Helper function to calculate correct total for multiple nights
  const getCorrectTotal = (booking) => {
    if (!booking) return 0;
    
    // If it's a hotel booking with multiple nights
    if (booking.category_name?.toLowerCase() === 'hotel' && booking.nightly_price && booking.number_of_nights) {
      return parseFloat(booking.nightly_price) * booking.number_of_nights;
    }
    
    // For all other categories, return the original total
    return parseFloat(booking.total_price);
  };

  // Helper to get breakdown text
  const getPriceBreakdown = (booking) => {
    if (booking.category_name?.toLowerCase() === 'hotel' && booking.nightly_price && booking.number_of_nights && booking.number_of_nights > 1) {
      return `${booking.nightly_price} per night × ${booking.number_of_nights} nights`;
    }
    return null;
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'hotel': return <Home className="w-6 h-6 text-blue-600" />;
      case 'restaurant': return <Utensils className="w-6 h-6 text-green-600" />;
      case 'movie': return <Film className="w-6 h-6 text-purple-600" />;
      case 'concert': return <Music className="w-6 h-6 text-pink-600" />;
      default: return <Ticket className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const statuses = {
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pending' },
      'CONFIRMED': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Confirmed' },
      'CANCELLED': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' },
      'COMPLETED': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, text: 'Completed' }
    };
    const statusInfo = statuses[status] || statuses['PENDING'];
    const Icon = statusInfo.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {statusInfo.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    
    try {
      toast.loading("Generating ticket...", { id: "download" });
      
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`ticket-${currentBooking?.booking_reference || bookingId}.pdf`);
      
      toast.success("Ticket downloaded!", { id: "download" });
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download ticket", { id: "download" });
    }
  };

  const printTicket = () => {
    const printContent = ticketRef.current;
    if (!printContent) return;
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Ticket - ${currentBooking?.booking_reference || 'Ticket'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              margin: 0;
            }
            .ticket-container {
              max-width: 800px;
              margin: 0 auto;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            ${printContent.outerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          <\/script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentBooking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking not found</h2>
          <Link to="/my-bookings" className="text-blue-600 hover:text-blue-700">
            Back to My Bookings
          </Link>
        </div>
      </div>
    );
  }

  const category = currentBooking.category_name?.toLowerCase();
  const isConfirmed = currentBooking.status === 'CONFIRMED';
  const isCompleted = currentBooking.status === 'COMPLETED';
  const showTicket = isConfirmed || isCompleted;
  const correctTotal = getCorrectTotal(currentBooking);
  const priceBreakdown = getPriceBreakdown(currentBooking);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/my-bookings" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Bookings
          </Link>
          
          {showTicket && (
            <div className="flex gap-3">
              <button
                onClick={downloadTicket}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Ticket
              </button>
              <button
                onClick={printTicket}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print Ticket
              </button>
            </div>
          )}
        </div>

        {/* Ticket / E-Ticket */}
        {showTicket && (
          <div ref={ticketRef} className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Ticket Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(category)}
                    <span className="text-sm font-medium text-blue-100">E-TICKET</span>
                  </div>
                  <h1 className="text-2xl font-bold">{currentBooking.title}</h1>
                  <p className="text-blue-100 mt-1">Booking Reference: {currentBooking.booking_reference}</p>
                </div>
                <div className="text-right">
                  <div className="bg-white/20 rounded-lg px-4 py-2">
                    <QrCode className="w-12 h-12 mx-auto" />
                    <span className="text-xs mt-1 block">Scan to verify</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Content */}
            <div className="p-8">
              {/* Status Badge */}
              <div className="mb-6">
                {getStatusBadge(currentBooking.status)}
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(currentBooking.start_date)}
                        {currentBooking.end_date && currentBooking.end_date !== currentBooking.start_date && (
                          <> - {formatDate(currentBooking.end_date)}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {currentBooking.time_slot && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Time</p>
                        <p className="font-medium text-gray-900">{currentBooking.time_slot}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Guests / Tickets</p>
                      <p className="font-medium text-gray-900">{currentBooking.number_of_guests}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{currentBooking.location || currentBooking.city || "TBD"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ticket className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-bold text-2xl text-blue-600">
                        ${correctTotal.toFixed(2)}
                      </p>
                      {priceBreakdown && (
                        <p className="text-xs text-gray-500 mt-1">
                          {priceBreakdown}
                        </p>
                      )}
                    </div>
                  </div>

                  {currentBooking.seat_numbers && currentBooking.seat_numbers.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Seats</p>
                        <p className="font-medium text-gray-900">{currentBooking.seat_numbers.join(', ')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Specific Details */}
              {category === 'movie' && currentBooking.show_time && (
                <div className="bg-purple-50 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold text-purple-800 mb-2">Movie Details</h4>
                  <p className="text-purple-700">Show Time: {formatTime(currentBooking.show_time)}</p>
                  {currentBooking.seat_type && <p className="text-purple-700">Seat Type: {currentBooking.seat_type}</p>}
                  {currentBooking.ticket_type && <p className="text-purple-700">Ticket Type: {currentBooking.ticket_type}</p>}
                </div>
              )}

              {category === 'concert' && (
                <div className="bg-pink-50 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold text-pink-800 mb-2">Concert Details</h4>
                  <p className="text-pink-700">Show Time: {formatTime(currentBooking.show_time)}</p>
                  {currentBooking.seat_type && <p className="text-pink-700">Zone: {currentBooking.seat_type}</p>}
                  {currentBooking.ticket_type && <p className="text-pink-700">Ticket Tier: {currentBooking.ticket_type}</p>}
                </div>
              )}

              {category === 'restaurant' && currentBooking.time_slot && (
                <div className="bg-green-50 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">Reservation Details</h4>
                  <p className="text-green-700">Time Slot: {currentBooking.time_slot}</p>
                  {currentBooking.special_requests && (
                    <p className="text-green-700 mt-1">Special Requests: {currentBooking.special_requests}</p>
                  )}
                </div>
              )}

              {category === 'hotel' && (
                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Stay Details</h4>
                  <p className="text-blue-700">Check-in: {formatDate(currentBooking.start_date)}</p>
                  <p className="text-blue-700">Check-out: {formatDate(currentBooking.end_date)}</p>
                  {currentBooking.number_of_nights && (
                    <p className="text-blue-700">Number of Nights: {currentBooking.number_of_nights}</p>
                  )}
                  {currentBooking.nightly_price && (
                    <p className="text-blue-700">Nightly Price: ${parseFloat(currentBooking.nightly_price).toFixed(2)}</p>
                  )}
                  {currentBooking.special_requests && (
                    <p className="text-blue-700 mt-1">Special Requests: {currentBooking.special_requests}</p>
                  )}
                </div>
              )}

              {/* Important Information */}
              <div className="border-t pt-6 mt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Important Information</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Please arrive 15 minutes before the scheduled time.</li>
                  <li>• Carry a valid ID proof for verification.</li>
                  <li>• Show this e-ticket at the venue entrance.</li>
                  <li>• For any queries, contact support@lastminute.com</li>
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t mt-6 pt-4 text-center text-xs text-gray-400">
                <p>This is a computer-generated ticket. No signature required.</p>
                <p>© 2024 LastMinute. All rights reserved.</p>
              </div>
            </div>
          </div>
        )}

        {/* Non-confirmed booking view */}
        {!showTicket && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking {currentBooking.status}</h2>
              <p className="text-gray-600 mb-6">
                Your booking is currently {currentBooking.status.toLowerCase()}. 
                E-ticket will be available once confirmed.
              </p>
              <div className="bg-gray-50 rounded-xl p-6 text-left">
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Reference:</strong> {currentBooking.booking_reference}</p>
                  <p><strong>Listing:</strong> {currentBooking.title}</p>
                  <p><strong>Date:</strong> {formatDate(currentBooking.start_date)}</p>
                  <p><strong>Guests:</strong> {currentBooking.number_of_guests}</p>
                  <p><strong>Total:</strong> ${correctTotal.toFixed(2)}</p>
                  {priceBreakdown && (
                    <p className="text-xs text-gray-500 mt-1">{priceBreakdown}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;