import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useListingStore } from "../../store/listing.store";
import { Edit, Trash2, Eye, PlusCircle, Home, Hotel, Utensils, Music, Film } from "lucide-react";
import toast from "react-hot-toast";

const MyListings = () => {
  const { sellerListings, fetchSellerListings, toggleAvailability, deleteListing, isLoading } = useListingStore();
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLocalError(null);
        await fetchSellerListings();
      } catch (error) {
        console.error("Error loading seller listings:", error);
        setLocalError("Failed to load your listings. Please try again.");
        toast.error("Failed to load listings");
      }
    };
    loadListings();
  }, [fetchSellerListings]);

  const listings = Array.isArray(sellerListings) ? sellerListings : [];

  const getCategoryIcon = (categoryName) => {
    switch(categoryName?.toLowerCase()) {
      case 'hotel': return <Hotel className="w-5 h-5 text-blue-500" />;
      case 'restaurant': return <Utensils className="w-5 h-5 text-green-500" />;
      case 'movie': return <Film className="w-5 h-5 text-purple-500" />;
      case 'concert': return <Music className="w-5 h-5 text-pink-500" />;
      default: return <Home className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '₹0';
    const num = Number(value);
    return isNaN(num) ? '₹0' : `₹${num.toFixed(2)}`;
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const handleToggleAvailability = async (listingId) => {
    try {
      await toggleAvailability(listingId);
      toast.success("Availability updated");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      try {
        await deleteListing(listingId);
        toast.success("Listing deleted");
      } catch (error) {
        toast.error("Failed to delete listing");
      }
    }
  };

  if (localError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-700">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6">{localError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Listings</h1>
            <p className="text-gray-400">Manage your properties and services</p>
          </div>
          <Link 
            to="/seller/create-listing" 
            className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> 
            Create New Listing
          </Link>
        </div>

        {/* Listings Table */}
        {listings.length > 0 ? (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Listing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {listings.map((listing) => {
                    if (!listing) return null;
                    
                    return (
                      <tr key={listing.id} className="hover:bg-gray-700/50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white">
                              {getCategoryIcon(listing.category_name)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {listing.title || 'Untitled Listing'}
                              </div>
                              <div className="text-sm text-gray-400">
                                ID: {listing.id || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300">
                            {listing.category_name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-purple-400">
                            {formatCurrency(listing.price)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-300">
                            {formatNumber(listing.total_bookings)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-green-400">
                            {formatCurrency(listing.total_earnings)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleAvailability(listing.id)}
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              listing.availability
                                ? 'bg-green-900/50 text-green-400 border border-green-700 hover:bg-green-800/50'
                                : 'bg-red-900/50 text-red-400 border border-red-700 hover:bg-red-800/50'
                            }`}
                          >
                            {listing.availability ? 'Available' : 'Booked'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <Link
                              to={`/listings/${listing.id}`}
                              className="text-purple-400 hover:text-purple-300 transition"
                              title="View"
                            >
                              <Eye className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-red-400 hover:text-red-300 transition"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-gray-700">
            <Home className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No listings yet</h3>
            <p className="text-gray-400 mb-6">Create your first listing to start earning</p>
            <Link 
              to="/seller/create-listing" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
            >
              <PlusCircle className="w-5 h-5 mr-2" /> 
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;