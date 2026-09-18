import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useBookingStore } from "../../store/booking.store";
import { Heart, MapPin, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const Wishlist = () => {
  const { wishlist, fetchWishlist, removeFromWishlist, isLoading } = useBookingStore();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (listingId) => {
    const result = await removeFromWishlist(listingId);
    if (result?.success) {
      toast.success("Removed from wishlist");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">Your saved items ({wishlist.length})</p>
        </div>

        {wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group">
                <Link to={`/listings/${item.id}`}>
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {item.images && item.images[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl">
                        {item.category_name === 'hotel' && '🏨'}
                        {item.category_name === 'restaurant' && '🍽️'}
                        {item.category_name === 'movie' && '🎬'}
                        {item.category_name === 'concert' && '🎤'}
                        {!item.category_name && '🏠'}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-1 shadow-lg">
                      <span className="font-bold text-blue-600">${item.price}</span>
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <Link to={`/listings/${item.id}`}>
                    <h3 className="font-bold text-lg text-gray-900 mb-2 hover:text-blue-600 transition">{item.title}</h3>
                  </Link>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />{item.city || item.location || "Location TBD"}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium text-gray-700">
                        {item.avg_rating ? Number(item.avg_rating).toFixed(1) : "New"}
                      </span>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)} 
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" 
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-3">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {item.category_name}
                    </span>
                  </div>
                  <Link 
                    to={`/listings/${item.id}/book`} 
                    className="mt-4 block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save items you're interested in</p>
            <Link 
              to="/listings" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Browse Listings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;