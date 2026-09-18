import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Menu, X, User, LogOut, PlusCircle, Heart, Sparkles, Home, Calendar, Ticket } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">Last Minute</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/listings" className="text-gray-700 hover:text-purple-600 transition flex items-center space-x-1 font-medium">
              <Home className="w-4 h-4" />
              <span>Browse</span>
            </Link>
            
            {user ? (
              <>
                {user.role === 'buyer' && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition font-medium">
                      Dashboard
                    </Link>
                    <Link to="/my-bookings" className="text-gray-700 hover:text-purple-600 transition font-medium">
                      My Bookings
                    </Link>
                    <Link to="/wishlist" className="text-gray-700 hover:text-pink-500 transition">
                      <Heart className="w-5 h-5" />
                    </Link>
                  </>
                )}
                
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller/dashboard" className="text-gray-700 hover:text-purple-600 transition font-medium">
                      Dashboard
                    </Link>
                    <Link to="/seller/listings" className="text-gray-700 hover:text-purple-600 transition font-medium">
                      My Listings
                    </Link>
                    <Link
                      to="/seller/create-listing"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-pink-700 transition flex items-center space-x-2 shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Listing</span>
                    </Link>
                  </>
                )}
                
                <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-purple-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-500 hover:text-pink-600 transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-purple-600 transition font-medium">
                  Login
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700 hover:text-purple-600 transition">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-purple-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/listings" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsOpen(false)}>
              Browse
            </Link>
            
            {user ? (
              <>
                {user.role === 'buyer' && (
                  <>
                    <Link to="/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                    <Link to="/my-bookings" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsOpen(false)}>
                      My Bookings
                    </Link>
                    <Link to="/wishlist" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsOpen(false)}>
                      Wishlist
                    </Link>
                  </>
                )}
                
                {user.role === 'seller' && (
                  <>
                    <Link to="/seller/dashboard" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsOpen(false)}>
                      Dashboard
                    </Link>
                    <Link to="/seller/listings" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsOpen(false)}>
                      My Listings
                    </Link>
                    <Link to="/seller/create-listing" className="block px-3 py-2 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg" onClick={() => setIsOpen(false)}>
                      Create Listing
                    </Link>
                  </>
                )}
                
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 rounded-lg" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg" onClick={() => setIsOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;