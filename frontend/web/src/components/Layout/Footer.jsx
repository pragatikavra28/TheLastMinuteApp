import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-purple-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">LastMinute</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Discover amazing last-minute deals on hotels, restaurants, movies, and concerts.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-200 transition">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-200 transition">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-200 transition">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 hover:bg-purple-200 transition">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/listings" className="text-gray-600 hover:text-purple-600 transition text-sm">Browse Listings</Link></li>
              <li><Link to="/categories" className="text-gray-600 hover:text-purple-600 transition text-sm">Categories</Link></li>
              <li><Link to="/how-it-works" className="text-gray-600 hover:text-purple-600 transition text-sm">How It Works</Link></li>
              <li><Link to="/faq" className="text-gray-600 hover:text-purple-600 transition text-sm">FAQ</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/contact" className="text-gray-600 hover:text-purple-600 transition text-sm">Contact Us</Link></li>
              <li><Link to="/help" className="text-gray-600 hover:text-purple-600 transition text-sm">Help Center</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-purple-600 transition text-sm">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-purple-600 transition text-sm">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600 text-sm">
                <Mail className="w-4 h-4 mr-2 text-purple-500" />
                support@lastminute.com
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <Phone className="w-4 h-4 mr-2 text-purple-500" />
                +1 (888) 123-4567
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                123 Main St, New York, NY 10001
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-purple-100 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LastMinute. Made with <Heart className="w-4 h-4 inline text-pink-500" /> for spontaneous travelers.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;