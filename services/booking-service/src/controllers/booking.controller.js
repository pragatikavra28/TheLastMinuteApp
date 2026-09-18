const bookingModel = require("../models/booking.model");

// Calculate price
exports.calculatePrice = async (req, res) => {
  try {
    console.log("======= CONTROLLER CALCULATE PRICE =======");
    console.log("Request body:", req.body);
    
    const { listingId, startDate, endDate, guests, ticketType, seatType, priceMultiplier } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "Listing ID is required"
      });
    }

    // Simple calculation - no category checks for now
    const guestsCount = guests || 1;
    const multiplier = priceMultiplier || 1.0;
    
    // Get listing price from database
    const pool = require("../config/db");
    const listingResult = await pool.query(
      `SELECT price FROM listings WHERE id = $1`,
      [listingId]
    );
    
    if (listingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }
    
    const basePrice = parseFloat(listingResult.rows[0].price);
    
    // Calculate seller amount
    const sellerAmount = basePrice * guestsCount * multiplier;
    
    // Calculate 10% commission
    const commission = sellerAmount * 0.10;
    
    // Buyer amount after commission
    const buyerAmount = sellerAmount + commission;
    
    // Taxes and fees
    const taxes = buyerAmount * 0.10;
    const serviceFee = buyerAmount * 0.05;
    const totalPrice = buyerAmount + taxes + serviceFee;
    
    const price = {
      sellerAmount: Number(sellerAmount.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      buyerAmount: Number(buyerAmount.toFixed(2)),
      basePrice: Number(buyerAmount.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      serviceFee: Number(serviceFee.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
      nights: 1,
      currency: 'INR'
    };
    
    console.log("Price calculated:", price);
    console.log("======= CONTROLLER CALCULATE PRICE END =======");

    res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error("Controller - Price calculation error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate price"
    });
  }
};

// Create booking
exports.createBooking = async (req, res) => {
  try {
    console.log("Create booking request body:", req.body);
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const {
      listingId,
      startDate,
      endDate,
      numberOfGuests,
      totalPrice,
      timeSlot,
      specialRequests,
      showTime,
      ticketType,
      seatType,
      selectedSeats
    } = req.body;

    // Validate required fields
    if (!listingId || !startDate || !numberOfGuests || !totalPrice) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Get listing details to check category
    const listing = await bookingModel.getListingDetails(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    const category = listing.category_name?.toLowerCase();

    // For movies/concerts, get fixed date/time from listing
    let finalStartDate = startDate;
    let finalEndDate = endDate || startDate;
    let finalTimeSlot = timeSlot || showTime;

    if (category === 'movie' || category === 'concert') {
      // Use seller's fixed date and time from listing details
      finalStartDate = listing.details?.show_date || listing.start_date || startDate;
      finalEndDate = finalStartDate;
      finalTimeSlot = listing.details?.show_time || listing.show_time || showTime;
      
      console.log(`Movie/Concert booking using fixed date: ${finalStartDate}, time: ${finalTimeSlot}`);
    }

    // Check availability with capacity
    const availability = await bookingModel.checkAvailability(
      listingId, 
      finalStartDate, 
      finalEndDate,
      finalTimeSlot
    );

    if (!availability.available) {
      return res.status(409).json({
        success: false,
        message: `No spots available for these dates.`,
        data: availability
      });
    }

    // Check if requested guests fit in remaining capacity
    if (numberOfGuests > availability.remainingCapacity) {
      return res.status(409).json({
        success: false,
        message: `Only ${availability.remainingCapacity} spots available. Please reduce number of guests to ${availability.remainingCapacity} or less.`,
        data: availability
      });
    }

    // Get seat/zone multiplier if applicable
    let priceMultiplier = 1.0;
    if ((category === 'movie' || category === 'concert') && seatType && listing.details?.seat_categories) {
      const selectedCategory = listing.details.seat_categories.find(cat => cat.name === seatType);
      if (selectedCategory) {
        priceMultiplier = selectedCategory.price_multiplier;
      }
    }

    // Calculate price to verify
    const priceData = {
      listingId,
      startDate: finalStartDate,
      endDate: finalEndDate,
      guests: numberOfGuests,
      ticketType: ticketType || 'adult',
      seatType: seatType,
      priceMultiplier: priceMultiplier
    };
    
    const calculatedPrice = await bookingModel.calculatePrice(priceData);

    // Create booking with category-specific fields
    const bookingData = {
      user_id: req.user.id,
      listing_id: listingId,
      start_date: finalStartDate,
      end_date: finalEndDate,
      number_of_guests: numberOfGuests,
      base_price: calculatedPrice.buyerAmount || calculatedPrice.basePrice,
      taxes: calculatedPrice.taxes,
      service_fee: calculatedPrice.serviceFee,
      total_price: totalPrice || calculatedPrice.totalPrice,
      booking_type: listing.category_name,
      time_slot: finalTimeSlot,
      special_requests: specialRequests,
      seat_numbers: selectedSeats || [],
      seat_category: seatType
    };

    const booking = await bookingModel.createBooking(bookingData);

    console.log("Booking created:", booking);

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking
    });

  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create booking"
    });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const bookings = await bookingModel.getUserBookings(req.user.id);

    res.json({
      success: true,
      data: bookings
    });

  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings"
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if id is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format"
      });
    }
    
    const booking = await bookingModel.getBookingById(id, req.user.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking"
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const { id } = req.params;
    const booking = await bookingModel.cancelBooking(id, req.user.id);

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking
    });

  } catch (error) {
    console.error("Cancel booking error:", error);
    
    if (error.message === 'Booking not found') {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }
    
    if (error.message === 'Booking already cancelled') {
      return res.status(400).json({
        success: false,
        message: "Booking already cancelled"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to cancel booking"
    });
  }
};

// Check availability
exports.checkAvailability = async (req, res) => {
  try {
    const { listingId, startDate, endDate, timeSlot } = req.query;

    // Get listing to check category
    const listing = await bookingModel.getListingDetails(listingId);
    const category = listing?.category_name?.toLowerCase();

    let finalStartDate = startDate;
    let finalEndDate = endDate || startDate;
    let finalTimeSlot = timeSlot;

    // For movies/concerts, use seller's fixed date/time
    if (category === 'movie' || category === 'concert') {
      finalStartDate = listing?.details?.show_date || listing?.start_date || startDate;
      finalEndDate = finalStartDate;
      finalTimeSlot = listing?.details?.show_time || listing?.show_time || timeSlot;
    }

    const availability = await bookingModel.checkAvailability(
      listingId, finalStartDate, finalEndDate, finalTimeSlot
    );

    res.json({
      success: true,
      data: {
        available: availability.available,
        maxCapacity: availability.maxCapacity,
        totalBooked: availability.totalBooked,
        remainingCapacity: availability.remainingCapacity
      }
    });

  } catch (error) {
    console.error("Check availability error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check availability"
    });
  }
};

// Update booking payment status (called by payment service)
exports.updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, payment_status, payment_data } = req.body;
        
        console.log(`Updating booking ${id} status to ${status}, payment status to ${payment_status}`);
        
        // Update booking status
        const result = await pool.query(
            `UPDATE bookings 
             SET status = $1, 
                 payment_status = $2,
                 updated_at = NOW()
             WHERE id = $3
             RETURNING *`,
            [status, payment_status, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }
        
        console.log(`✅ Booking ${id} updated successfully to ${status}`);
        
        res.json({
            success: true,
            message: "Booking status updated",
            data: result.rows[0]
        });
        
    } catch (error) {
        console.error("Update payment status error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update booking status"
        });
    }
};