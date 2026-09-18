import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useListingStore } from "../../store/listing.store";
import { 
  ChevronLeft, Hotel, Utensils, Music, Film, 
  MapPin, Calendar, Clock, Users, Wifi, Coffee, 
  Car, Dumbbell, Waves, Snowflake, Star, Ticket,
  Armchair, Sparkles, Info, Phone, Mail, Globe
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const CreateListing = () => {
  const navigate = useNavigate();
  const { createListing, isLoading } = useListingStore();
  
  const [step, setStep] = useState(1); // Step 1: Category, Step 2: Form
  const [selectedCategory, setSelectedCategory] = useState("");
  
 const [formData, setFormData] = useState({
  // Common fields
  title: "",
  description: "",
  price: "",
  location: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  phone: "",
  email: "",
  images: [],
  
  // Hotel specific
  hotelType: "", // luxury, budget, boutique
  acNonAc: "ac",
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  nearbyPlaces: [],
  amenities: [],
  checkInTime: "14:00",
  checkOutTime: "11:00",
  nearbyPlaceInput: "",
  amenityInput: "",
  
  // Restaurant specific
  cuisineType: "",
  seatingCapacity: 50,
  openingTime: "11:00",
  closingTime: "23:00",
  hasOutdoorSeating: false,
  hasHomeDelivery: false,
  avgCostForTwo: "",
  nearbyLandmarks: [],
  
  // Concert specific (RENAME to concertSeatCategories)
  performerName: "",
  concertDate: "",
  concertTime: "",
  venue: "",
  gateOpenTime: "",
  ageRestriction: 18,
  concertSeatCategories: [
    { name: "General", priceMultiplier: 1.0, availableSeats: 500 },
    { name: "VIP", priceMultiplier: 2.0, availableSeats: 100 },
    { name: "Front Row", priceMultiplier: 3.0, availableSeats: 50 }
  ],
  nearbyHotels: [],
  parkingAvailable: true,
  
  // Theater/Movie specific (RENAME to movieSeatCategories)
  movieName: "",
  showDate: "",
  showTime: "",
  theaterName: "",
  screenNumber: "",
  seatLayout: "standard",
  movieSeatCategories: [
    { name: "Standard", priceMultiplier: 1.0, availableSeats: 150 },
    { name: "Recliner", priceMultiplier: 1.8, availableSeats: 30 },
    { name: "Luxury", priceMultiplier: 2.5, availableSeats: 20 }
  ],
  language: "Hindi",
  certification: "UA",
  duration: 150,
  genre: ""
});

  const categories = [
    { 
      id: "hotel", 
      name: "Hotel", 
      icon: Hotel, 
      gradient: "from-blue-500 to-cyan-500",
      description: "List your hotel or accommodation",
      color: "blue"
    },
    { 
      id: "restaurant", 
      name: "Restaurant", 
      icon: Utensils, 
      gradient: "from-green-500 to-emerald-500",
      description: "List your restaurant or cafe",
      color: "green"
    },
    { 
      id: "concert", 
      name: "Concert", 
      icon: Music, 
      gradient: "from-pink-500 to-rose-500",
      description: "List your concert or live event",
      color: "pink"
    },
    { 
      id: "movie", 
      name: "Theater / Movie", 
      icon: Film, 
      gradient: "from-purple-500 to-violet-500",
      description: "List your movie show",
      color: "purple"
    },
  ];

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
        [`${field}Input`]: ""
      }));
    }
  };

  const handleArrayRemove = (field, index) => {
    const newArray = [...formData[field]];
    newArray.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

 const handleSeatCategoryChange = (type, index, field, value) => {
  const updated = [...formData[type]];
  updated[index][field] = field === 'priceMultiplier' ? parseFloat(value) : parseInt(value);
  setFormData(prev => ({ ...prev, [type]: updated }));
};

const addSeatCategory = (type) => {
  setFormData(prev => ({
    ...prev,
    [type]: [
      ...prev[type],
      { name: "New Category", priceMultiplier: 1.0, availableSeats: 10 }
    ]
  }));
};

const removeSeatCategory = (type, index) => {
  const updated = [...formData[type]];
  updated.splice(index, 1);
  setFormData(prev => ({ ...prev, [type]: updated }));
};

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Map category names to IDs
  const categoryIdMap = {
    'hotel': 1,
    'movie': 2,
    'concert': 3,
    'restaurant': 4
  };
  
  // ONLY BASIC FIELDS
  const listingData = {
    title: formData.title,
    description: formData.description,
    price: parseFloat(formData.price),
    category_id: categoryIdMap[selectedCategory] || 1,
    location: formData.location,
    city: formData.city,
    address: formData.address
  };

  console.log("Submitting listing:", listingData);
  
  const result = await createListing(listingData);
  if (result.success) {
    navigate("/seller/listings");
  }
};
  const renderHotelForm = () => (
    <div className="space-y-6">
      <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Hotel className="w-5 h-5 text-blue-400" />
          Hotel Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hotel Type</label>
            <select
              name="hotelType"
              value={formData.hotelType}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            >
              <option value="luxury">Luxury (5 Star)</option>
              <option value="premium">Premium (4 Star)</option>
              <option value="standard">Standard (3 Star)</option>
              <option value="budget">Budget</option>
              <option value="boutique">Boutique</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">AC / Non-AC</label>
            <select
              name="acNonAc"
              value={formData.acNonAc}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            >
              <option value="ac">AC</option>
              <option value="non-ac">Non-AC</option>
              <option value="both">Both Available</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Max Guests</label>
            <input
              type="number"
              name="maxGuests"
              value={formData.maxGuests}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Check-in Time</label>
              <input
                type="time"
                name="checkInTime"
                value={formData.checkInTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Check-out Time</label>
              <input
                type="time"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Places */}
      <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Nearby Places to Visit</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={formData.nearbyPlaceInput}
            onChange={(e) => setFormData(prev => ({ ...prev, nearbyPlaceInput: e.target.value }))}
            placeholder="e.g., Taj Mahal, India Gate"
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <button
            type="button"
            onClick={() => handleArrayAdd("nearbyPlaces", formData.nearbyPlaceInput)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.nearbyPlaces.map((place, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
              {place}
              <button type="button" onClick={() => handleArrayRemove("nearbyPlaces", index)} className="ml-2 text-blue-400 hover:text-blue-200">×</button>
            </span>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Amenities</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={formData.amenityInput}
            onChange={(e) => setFormData(prev => ({ ...prev, amenityInput: e.target.value }))}
            placeholder="e.g., WiFi, Pool, Parking, Gym"
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <button
            type="button"
            onClick={() => handleArrayAdd("amenities", formData.amenityInput)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.amenities.map((amenity, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">
              {amenity}
              <button type="button" onClick={() => handleArrayRemove("amenities", index)} className="ml-2 text-blue-400 hover:text-blue-200">×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRestaurantForm = () => (
    <div className="space-y-6">
      <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-green-400" />
          Restaurant Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cuisine Type</label>
            <input
              type="text"
              name="cuisineType"
              value={formData.cuisineType}
              onChange={handleChange}
              placeholder="Italian, Chinese, Indian, etc."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Seating Capacity</label>
            <input
              type="number"
              name="seatingCapacity"
              value={formData.seatingCapacity}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Average Cost for Two (₹)</label>
            <input
              type="number"
              name="avgCostForTwo"
              value={formData.avgCostForTwo}
              onChange={handleChange}
              placeholder="e.g., 1500"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Opening Time</label>
              <input
                type="time"
                name="openingTime"
                value={formData.openingTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Closing Time</label>
              <input
                type="time"
                name="closingTime"
                value={formData.closingTime}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="hasOutdoorSeating"
              checked={formData.hasOutdoorSeating}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 rounded"
            />
            <span className="text-gray-300">Has Outdoor Seating</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="hasHomeDelivery"
              checked={formData.hasHomeDelivery}
              onChange={handleChange}
              className="w-5 h-5 text-green-600 rounded"
            />
            <span className="text-gray-300">Offers Home Delivery</span>
          </label>
        </div>
      </div>

      {/* Nearby Landmarks */}
      <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Nearby Landmarks</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={formData.nearbyPlaceInput}
            onChange={(e) => setFormData(prev => ({ ...prev, nearbyPlaceInput: e.target.value }))}
            placeholder="e.g., Mall, Metro Station"
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <button
            type="button"
            onClick={() => handleArrayAdd("nearbyLandmarks", formData.nearbyPlaceInput)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.nearbyLandmarks.map((landmark, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 bg-green-900/50 text-green-300 rounded-full text-sm">
              {landmark}
              <button type="button" onClick={() => handleArrayRemove("nearbyLandmarks", index)} className="ml-2 text-green-400 hover:text-green-200">×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConcertForm = () => (
    <div className="space-y-6">
      <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Music className="w-5 h-5 text-pink-400" />
          Concert Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Performer/Band Name</label>
            <input
              type="text"
              name="performerName"
              value={formData.performerName}
              onChange={handleChange}
              placeholder="e.g., Coldplay, AR Rahman"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="e.g., Jio Garden, Stadium"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Concert Date</label>
            <input
              type="date"
              name="concertDate"
              value={formData.concertDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Concert Time</label>
            <input
              type="time"
              name="concertTime"
              value={formData.concertTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gates Open Time</label>
            <input
              type="time"
              name="gateOpenTime"
              value={formData.gateOpenTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age Restriction</label>
            <select
              name="ageRestriction"
              value={formData.ageRestriction}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            >
              <option value="0">All Ages</option>
              <option value="12">12+</option>
              <option value="16">16+</option>
              <option value="18">18+</option>
              <option value="21">21+</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 mt-4">
          <input
            type="checkbox"
            name="parkingAvailable"
            checked={formData.parkingAvailable}
            onChange={handleChange}
            className="w-5 h-5 text-pink-600 rounded"
          />
          <span className="text-gray-300">Parking Available</span>
        </label>
      </div>

      {/* Seat/Zone Categories - Concert */}
<div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
  <h3 className="text-lg font-semibold text-white mb-4">Ticket Categories / Zones</h3>
  {formData.concertSeatCategories.map((category, index) => (
    <div key={index} className="bg-gray-700/50 p-4 rounded-lg mb-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Category Name</label>
          <input
            type="text"
            value={category.name}
            onChange={(e) => handleSeatCategoryChange('concertSeatCategories', index, 'name', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Price Multiplier</label>
          <input
            type="number"
            step="0.1"
            value={category.priceMultiplier}
            onChange={(e) => handleSeatCategoryChange('concertSeatCategories', index, 'priceMultiplier', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Available Seats</label>
          <input
            type="number"
            value={category.availableSeats}
            onChange={(e) => handleSeatCategoryChange('concertSeatCategories', index, 'availableSeats', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>
      {formData.concertSeatCategories.length > 1 && (
        <button type="button" onClick={() => removeSeatCategory('concertSeatCategories', index)} className="mt-2 text-red-400 text-sm hover:text-red-300">
          Remove Category
        </button>
      )}
    </div>
  ))}
  <button type="button" onClick={() => addSeatCategory('concertSeatCategories')} className="text-pink-400 text-sm hover:text-pink-300">
    + Add Zone Category
  </button>
</div>

      {/* Nearby Hotels */}
      <div className="bg-pink-500/10 rounded-xl p-4 border border-pink-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Nearby Hotels/Accommodation</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={formData.nearbyPlaceInput}
            onChange={(e) => setFormData(prev => ({ ...prev, nearbyPlaceInput: e.target.value }))}
            placeholder="e.g., Taj Hotel, Marriott"
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <button
            type="button"
            onClick={() => handleArrayAdd("nearbyHotels", formData.nearbyPlaceInput)}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.nearbyHotels.map((hotel, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 bg-pink-900/50 text-pink-300 rounded-full text-sm">
              {hotel}
              <button type="button" onClick={() => handleArrayRemove("nearbyHotels", index)} className="ml-2 text-pink-400 hover:text-pink-200">×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMovieForm = () => (
    <div className="space-y-6">
      <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Film className="w-5 h-5 text-purple-400" />
          Movie / Theater Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Movie Name</label>
            <input
              type="text"
              name="movieName"
              value={formData.movieName}
              onChange={handleChange}
              placeholder="e.g., Avatar 2, Jawan"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Theater Name</label>
            <input
              type="text"
              name="theaterName"
              value={formData.theaterName}
              onChange={handleChange}
              placeholder="e.g., PVR, Cinepolis, INOX"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Screen Number</label>
            <input
              type="text"
              name="screenNumber"
              value={formData.screenNumber}
              onChange={handleChange}
              placeholder="e.g., Screen 1, IMAX"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Show Date</label>
            <input
              type="date"
              name="showDate"
              value={formData.showDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Show Time</label>
            <input
              type="time"
              name="showTime"
              value={formData.showTime}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Seat Layout Type</label>
            <select
              name="seatLayout"
              value={formData.seatLayout}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            >
              <option value="standard">Standard Seats</option>
              <option value="recliner">Recliner Seats</option>
              <option value="luxury">Luxury Seats</option>
              <option value="sofa">Sofa Seats</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            >
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              <option value="Malayalam">Malayalam</option>
              <option value="Kannada">Kannada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Certification</label>
            <select
              name="certification"
              value={formData.certification}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            >
              <option value="U">U - Universal</option>
              <option value="UA">UA - Parental Guidance</option>
              <option value="A">A - Adult Only</option>
              <option value="S">S - Special</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="30"
              step="5"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Genre</label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="Action, Comedy, Drama, etc."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      {/* Seat Categories */}
      {/* Seat Categories - Movie */}
<div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
  <h3 className="text-lg font-semibold text-white mb-4">Seat Categories</h3>
  {formData.movieSeatCategories.map((category, index) => (
    <div key={index} className="bg-gray-700/50 p-4 rounded-lg mb-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Category Name</label>
          <input
            type="text"
            value={category.name}
            onChange={(e) => handleSeatCategoryChange('movieSeatCategories', index, 'name', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Price Multiplier</label>
          <input
            type="number"
            step="0.1"
            value={category.priceMultiplier}
            onChange={(e) => handleSeatCategoryChange('movieSeatCategories', index, 'priceMultiplier', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Available Seats</label>
          <input
            type="number"
            value={category.availableSeats}
            onChange={(e) => handleSeatCategoryChange('movieSeatCategories', index, 'availableSeats', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
      </div>
      {formData.movieSeatCategories.length > 1 && (
        <button type="button" onClick={() => removeSeatCategory('movieSeatCategories', index)} className="mt-2 text-red-400 text-sm hover:text-red-300">
          Remove Category
        </button>
      )}
    </div>
  ))}
  <button type="button" onClick={() => addSeatCategory('movieSeatCategories')} className="text-purple-400 text-sm hover:text-purple-300">
    + Add Seat Category
  </button>
</div>
    </div>
  );

  const renderCommonFields = () => (
    <div className="space-y-6">
      <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-400" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title / Name</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder={selectedCategory === 'hotel' ? "e.g., Taj Palace Hotel" : 
                          selectedCategory === 'restaurant' ? "e.g., Italian Bistro" :
                          selectedCategory === 'concert' ? "e.g., Coldplay Concert" :
                          "e.g., Avatar 2 Movie"}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹ per person/ticket)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describe your listing in detail..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-400" />
          Location Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Location / Area</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., Connaught Place, Andheri West"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="e.g., Mumbai, Delhi, Bangalore"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Full Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              placeholder="Complete address"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-purple-400" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@example.com"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Category Selection Screen
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center text-gray-400 hover:text-purple-400 transition"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </button>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What would you like to <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">list?</span>
            </h1>
            <p className="text-gray-400 text-lg">Choose a category to get started</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  onClick={() => handleCategorySelect(category.id)}
                  className="cursor-pointer"
                >
                  <div className={`bg-gradient-to-br ${category.gradient} rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all`}>
                    <IconComponent className="w-16 h-16 text-white mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                    <p className="text-white/80 text-sm">{category.description}</p>
                    <div className="mt-4 flex items-center text-white/70 text-sm">
                      Click to continue →
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Form Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => setStep(1)} 
            className="inline-flex items-center text-gray-400 hover:text-purple-400 transition"
          >
            <ChevronLeft className="w-5 h-5 mr-1" /> Back to Categories
          </button>
          <span className="text-gray-400 text-sm">Step 2 of 2</span>
        </div>

        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          <div className={`bg-gradient-to-r ${
            selectedCategory === 'hotel' ? 'from-blue-700 to-cyan-700' :
            selectedCategory === 'restaurant' ? 'from-green-700 to-emerald-700' :
            selectedCategory === 'concert' ? 'from-pink-700 to-rose-700' :
            'from-purple-700 to-violet-700'
          } px-8 py-6`}>
            <h1 className="text-3xl font-bold text-white mb-2">Create {selectedCategory === 'hotel' ? 'Hotel' : selectedCategory === 'restaurant' ? 'Restaurant' : selectedCategory === 'concert' ? 'Concert' : 'Movie'} Listing</h1>
            <p className="text-white/80">Fill in the details below</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {renderCommonFields()}
            
            {selectedCategory === 'hotel' && renderHotelForm()}
            {selectedCategory === 'restaurant' && renderRestaurantForm()}
            {selectedCategory === 'concert' && renderConcertForm()}
            {selectedCategory === 'movie' && renderMovieForm()}

            <div className="border-t border-gray-700 pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition transform hover:-translate-y-1 shadow-lg"
              >
                {isLoading ? "Creating..." : "Create Listing"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;