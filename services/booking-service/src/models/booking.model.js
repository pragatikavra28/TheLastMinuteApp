const pool = require("../config/db");

// Create a new booking
const createBooking = async (bookingData) => {
  const {
    user_id,
    listing_id,
    start_date,
    end_date,
    number_of_guests,
    special_requests,
    base_price,
    taxes,
    service_fee,
    total_price,
    booking_type,
    time_slot,
    seat_numbers
  } = bookingData;

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const bookingResult = await client.query(
      `INSERT INTO bookings (
        user_id, listing_id, start_date, end_date, 
        number_of_guests, special_requests, base_price, 
        taxes, service_fee, total_price, booking_type, 
        time_slot, seat_numbers, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        user_id, listing_id, start_date, end_date,
        number_of_guests || 1, special_requests || null, base_price,
        taxes || 0, service_fee || 0, total_price,
        booking_type || 'standard', time_slot || null,
        seat_numbers || [], 'PENDING', 'PENDING'
      ]
    );

    const capacityCheck = await client.query(
      `SELECT l.*, ld.max_guests, ld.total_seats,
              COALESCE(SUM(b.number_of_guests), 0) as total_booked
       FROM listings l
       LEFT JOIN listing_details ld ON l.id = ld.listing_id
       LEFT JOIN bookings b ON l.id = b.listing_id 
         AND b.status IN ('PENDING', 'CONFIRMED')
         AND b.start_date >= CURRENT_DATE
       WHERE l.id = $1
       GROUP BY l.id, ld.id`,
      [listing_id]
    );

    const listing = capacityCheck.rows[0];
    const maxCapacity = listing.max_guests || listing.total_seats || 1;
    const totalBooked = parseInt(listing.total_booked);
    
    if (totalBooked >= maxCapacity) {
      await client.query(
        `UPDATE listings 
         SET availability = false, 
             updated_at = NOW() 
         WHERE id = $1`,
        [listing_id]
      );
      console.log(`Listing ${listing_id} is now fully booked.`);
    }

    await client.query('COMMIT');
    return bookingResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Create booking transaction error:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Get listing category
const getListingCategory = async (listingId) => {
  try {
    const result = await pool.query(
      `SELECT c.name as category_name
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       WHERE l.id = $1`,
      [listingId]
    );

    if (result.rows.length === 0) {
      throw new Error('Listing not found');
    }

    return result.rows[0].category_name?.toLowerCase();
  } catch (error) {
    console.error("Get listing category error:", error);
    throw error;
  }
};

// Get listing details
const getListingDetails = async (listingId) => {
  try {
    const result = await pool.query(
      `SELECT l.*, c.name as category_name, ld.*
       FROM listings l
       LEFT JOIN categories c ON l.category_id = c.id
       LEFT JOIN listing_details ld ON l.id = ld.listing_id
       WHERE l.id = $1`,
      [listingId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Get listing details error:", error);
    throw error;
  }
};

// Calculate price for a booking with 10% commission (INR)
const calculatePrice = async (priceData) => {
  try {
    console.log("Model - calculatePrice received:", priceData);
    
    const { listingId, startDate, endDate, guests, ticketType, seatType, priceMultiplier = 1.0 } = priceData;

    // Get listing price and details
    const listingResult = await pool.query(
      `SELECT l.price, l.category_id, c.name as category_name, ld.*
       FROM listings l
       JOIN categories c ON l.category_id = c.id
       LEFT JOIN listing_details ld ON l.id = ld.listing_id
       WHERE l.id = $1`,
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      throw new Error('Listing not found');
    }

    let { price, category_name } = listingResult.rows[0];
    const category = category_name?.toLowerCase();
    price = parseFloat(price);

    console.log("Listing price:", price);
    console.log("Category:", category);
    console.log("Guests:", guests);
    console.log("Price multiplier:", priceMultiplier);

    let sellerAmount = 0;
    let nights = 1;

    switch(category) {
      case 'hotel':
        const start = new Date(startDate);
        const end = new Date(endDate);
        nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (nights < 1) {
          throw new Error('End date must be after start date');
        }
        sellerAmount = price * nights * (guests || 1);
        break;

      case 'restaurant':
        sellerAmount = price * (guests || 1);
        break;

      case 'movie':
      case 'concert':
        sellerAmount = price * (guests || 1) * priceMultiplier;
        break;

      default:
        sellerAmount = price * (guests || 1);
    }

    console.log("Seller amount before commission:", sellerAmount);

    // Calculate 10% commission
    const commission = sellerAmount * 0.10;
    const buyerAmount = sellerAmount + commission;

    // Calculate taxes and fees on buyer amount
    const taxes = buyerAmount * 0.10;
    const serviceFee = buyerAmount * 0.05;
    const totalPrice = buyerAmount + taxes + serviceFee;

    const result = {
      sellerAmount: Number(sellerAmount.toFixed(2)),
      commission: Number(commission.toFixed(2)),
      buyerAmount: Number(buyerAmount.toFixed(2)),
      basePrice: Number(buyerAmount.toFixed(2)),
      taxes: Number(taxes.toFixed(2)),
      serviceFee: Number(serviceFee.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
      nights: category === 'hotel' ? nights : 1,
      currency: 'INR'
    };
    
    console.log("Final price result:", result);

    return result;
  } catch (error) {
    console.error("Calculate price model error:", error);
    throw error;
  }
};

// Check availability with capacity tracking
const checkAvailability = async (listingId, startDate, endDate, timeSlot = null) => {
  try {
    // First, get the listing details to check max capacity
    const listingResult = await pool.query(
      `SELECT l.*, ld.max_guests, ld.total_seats,
              COALESCE(SUM(b.number_of_guests), 0) as total_booked
       FROM listings l
       LEFT JOIN listing_details ld ON l.id = ld.listing_id
       LEFT JOIN bookings b ON l.id = b.listing_id 
         AND b.status IN ('PENDING', 'CONFIRMED')
         AND (b.start_date <= $2 AND b.end_date >= $2)
       WHERE l.id = $1
       GROUP BY l.id, ld.id`,
      [listingId, startDate]
    );

    if (listingResult.rows.length === 0) {
      throw new Error('Listing not found');
    }

    const listing = listingResult.rows[0];
    const maxCapacity = listing.max_guests || listing.total_seats || 1;
    const totalBooked = parseInt(listing.total_booked) || 0;
    const available = totalBooked < maxCapacity;

    console.log(`Availability check - Listing ${listingId}:`, {
      maxCapacity,
      totalBooked,
      available,
      date: startDate,
      timeSlot
    });

    return {
      available,
      maxCapacity,
      totalBooked,
      remainingCapacity: maxCapacity - totalBooked
    };

  } catch (error) {
    console.error("Check availability model error:", error);
    throw error;
  }
};

// Get booking by ID
const getBookingById = async (bookingId, userId) => {
  try {
    const id = parseInt(bookingId);
    if (isNaN(id)) {
      throw new Error("Invalid booking ID");
    }

    const result = await pool.query(
      `SELECT b.*, 
              l.title, l.description, l.price, l.location, l.images,
              l.owner_id,
              u.name as owner_name, u.email as owner_email,
              c.name as category_name,
              buyer.name as buyer_name, buyer.email as buyer_email,
              ld.seat_categories
       FROM bookings b
       JOIN listings l ON b.listing_id = l.id
       JOIN users u ON l.owner_id = u.id
       JOIN categories c ON l.category_id = c.id
       JOIN users buyer ON b.user_id = buyer.id
       LEFT JOIN listing_details ld ON l.id = ld.listing_id
       WHERE b.id = $1 AND (b.user_id = $2 OR l.owner_id = $2)`,
      [id, userId]
    );

    return result.rows[0];
  } catch (error) {
    console.error("Get booking by ID model error:", error);
    throw error;
  }
};

// Get user bookings
const getUserBookings = async (userId) => {
  const result = await pool.query(
    `SELECT b.*, 
            l.title, l.location, l.images,
            c.name as category_name,
            u.name as owner_name
     FROM bookings b
     JOIN listings l ON b.listing_id = l.id
     JOIN categories c ON l.category_id = c.id
     JOIN users u ON l.owner_id = u.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );

  return result.rows;
};

// Get seller bookings
const getSellerBookings = async (sellerId) => {
  const result = await pool.query(
    `SELECT b.*, 
            l.title, l.location,
            u.name as buyer_name, u.email as buyer_email
     FROM bookings b
     JOIN listings l ON b.listing_id = l.id
     JOIN users u ON b.user_id = u.id
     WHERE l.owner_id = $1
     ORDER BY b.created_at DESC`,
    [sellerId]
  );

  return result.rows;
};

// Cancel booking
const cancelBooking = async (bookingId, userId) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const checkResult = await client.query(
      'SELECT listing_id, status FROM bookings WHERE id = $1 AND user_id = $2',
      [bookingId, userId]
    );

    if (checkResult.rows.length === 0) {
      throw new Error('Booking not found');
    }

    if (checkResult.rows[0].status === 'CANCELLED') {
      throw new Error('Booking already cancelled');
    }

    const listingId = checkResult.rows[0].listing_id;

    const cancelResult = await client.query(
      `UPDATE bookings 
       SET status = 'CANCELLED', 
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [bookingId, userId]
    );

    const capacityCheck = await client.query(
      `SELECT l.*, ld.max_guests, ld.total_seats,
              COALESCE(SUM(b.number_of_guests), 0) as total_booked
       FROM listings l
       LEFT JOIN listing_details ld ON l.id = ld.listing_id
       LEFT JOIN bookings b ON l.id = b.listing_id 
         AND b.status IN ('PENDING', 'CONFIRMED')
         AND b.start_date >= CURRENT_DATE
       WHERE l.id = $1
       GROUP BY l.id, ld.id`,
      [listingId]
    );

    const listing = capacityCheck.rows[0];
    const maxCapacity = listing.max_guests || listing.total_seats || 1;
    const totalBooked = parseInt(listing.total_booked);
    
    if (totalBooked < maxCapacity && !listing.availability) {
      await client.query(
        `UPDATE listings 
         SET availability = true, 
             updated_at = NOW() 
         WHERE id = $1`,
        [listingId]
      );
      console.log(`Listing ${listingId} now has availability.`);
    }

    await client.query('COMMIT');
    return cancelResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Cancel booking transaction error:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Update booking status (for sellers)
const updateBookingStatus = async (bookingId, sellerId, status) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `UPDATE bookings b
       SET status = $1,
           updated_at = NOW()
       FROM listings l
       WHERE b.id = $2 
         AND b.listing_id = l.id 
         AND l.owner_id = $3
       RETURNING b.*`,
      [status, bookingId, sellerId]
    );

    if (status === 'CANCELLED' || status === 'COMPLETED') {
      const booking = result.rows[0];
      
      const capacityCheck = await client.query(
        `SELECT l.*, ld.max_guests, ld.total_seats,
                COALESCE(SUM(b.number_of_guests), 0) as total_booked
         FROM listings l
         LEFT JOIN listing_details ld ON l.id = ld.listing_id
         LEFT JOIN bookings b ON l.id = b.listing_id 
           AND b.status IN ('PENDING', 'CONFIRMED')
           AND b.start_date >= CURRENT_DATE
         WHERE l.id = $1
         GROUP BY l.id, ld.id`,
        [booking.listing_id]
      );

      const listing = capacityCheck.rows[0];
      const maxCapacity = listing.max_guests || listing.total_seats || 1;
      const totalBooked = parseInt(listing.total_booked);
      
      if (totalBooked < maxCapacity && !listing.availability) {
        await client.query(
          `UPDATE listings 
           SET availability = true, 
               updated_at = NOW() 
           WHERE id = $1`,
          [booking.listing_id]
        );
      }
    }

    await client.query('COMMIT');
    return result.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Update booking status transaction error:", error);
    throw error;
  } finally {
    client.release();
  }
};

// Update booking payment status (for payment service)
const updateBookingPaymentStatus = async (bookingId, status, paymentStatus = null) => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      let query = `
        UPDATE bookings 
        SET status = $1, 
            updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;
      const params = [status, bookingId];
      
      if (paymentStatus) {
        query = `
          UPDATE bookings 
          SET status = $1, 
              payment_status = $2,
              updated_at = NOW()
          WHERE id = $3
          RETURNING *
        `;
        params.unshift(paymentStatus);
        params.push(bookingId);
      }
      
      const result = await client.query(query, params);
      await client.query('COMMIT');
      
      if (result.rows.length === 0) {
        console.log(`Booking ${bookingId} not found for status update`);
        return null;
      }
      
      console.log(`Booking ${bookingId} updated: status=${status}, payment_status=${paymentStatus || 'unchanged'}`);
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Update booking payment status transaction error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update booking payment status error:", error);
    throw error;
  }
};

// Get booking stats for seller
const getSellerBookingStats = async (sellerId) => {
  const result = await pool.query(
    `SELECT 
       COUNT(*) as total_bookings,
       SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_bookings,
       SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as confirmed_bookings,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_bookings,
       SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_bookings,
       COALESCE(SUM(total_price), 0) as total_revenue
     FROM bookings b
     JOIN listings l ON b.listing_id = l.id
     WHERE l.owner_id = $1`,
    [sellerId]
  );

  return result.rows[0];
};

// Get booking stats for buyer
const getBuyerBookingStats = async (buyerId) => {
  const result = await pool.query(
    `SELECT 
       COUNT(*) as total_bookings,
       SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_bookings,
       SUM(CASE WHEN status = 'CONFIRMED' THEN 1 ELSE 0 END) as active_bookings,
       SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_bookings,
       SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled_bookings,
       COALESCE(SUM(total_price), 0) as total_spent
     FROM bookings
     WHERE user_id = $1`,
    [buyerId]
  );

  return result.rows[0];
};

// Get listing with current availability status
const getListingWithAvailability = async (listingId) => {
  try {
    const result = await pool.query(
      `SELECT l.*, ld.max_guests, ld.total_seats,
              COALESCE(SUM(b.number_of_guests), 0) as total_booked
       FROM listings l
       LEFT JOIN listing_details ld ON l.id = ld.listing_id
       LEFT JOIN bookings b ON l.id = b.listing_id 
         AND b.status IN ('PENDING', 'CONFIRMED')
         AND b.start_date >= CURRENT_DATE
       WHERE l.id = $1
       GROUP BY l.id, ld.id`,
      [listingId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const listing = result.rows[0];
    const maxCapacity = listing.max_guests || listing.total_seats || 1;
    const totalBooked = parseInt(listing.total_booked);
    
    const shouldBeAvailable = totalBooked < maxCapacity;
    
    if (listing.availability !== shouldBeAvailable) {
      await pool.query(
        `UPDATE listings 
         SET availability = $1, updated_at = NOW() 
         WHERE id = $2`,
        [shouldBeAvailable, listingId]
      );
      listing.availability = shouldBeAvailable;
    }

    return {
      ...listing,
      totalBooked,
      remainingCapacity: maxCapacity - totalBooked
    };
  } catch (error) {
    console.error("Get listing with availability error:", error);
    throw error;
  }
};

module.exports = {
  createBooking,
  getListingCategory,
  getListingDetails,
  calculatePrice,
  checkAvailability,
  getBookingById,
  getUserBookings,
  getSellerBookings,
  cancelBooking,
  updateBookingStatus,
  updateBookingPaymentStatus,
  getSellerBookingStats,
  getBuyerBookingStats,
  getListingWithAvailability
};