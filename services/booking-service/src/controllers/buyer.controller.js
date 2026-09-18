const pool = require("../config/db");

// Get buyer dashboard stats
exports.getBuyerStats = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT id) as total_bookings,
        COALESCE(SUM(total_price), 0) as total_spent,
        COUNT(DISTINCT CASE WHEN status = 'CONFIRMED' THEN id END) as active_bookings,
        COUNT(DISTINCT CASE WHEN status = 'COMPLETED' THEN id END) as completed_bookings,
        COUNT(DISTINCT CASE WHEN status = 'CANCELLED' THEN id END) as cancelled_bookings,
        COUNT(DISTINCT CASE WHEN status = 'PENDING' THEN id END) as pending_bookings
      FROM bookings
      WHERE user_id = $1
    `, [buyerId]);

    // Upcoming bookings
    const upcomingBookings = await pool.query(`
      SELECT 
        b.*,
        l.title,
        l.location,
        c.name as category_name,
        c.icon as category_icon
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN categories c ON l.category_id = c.id
      WHERE b.user_id = $1 
        AND b.start_date >= CURRENT_DATE 
        AND b.status IN ('PENDING', 'CONFIRMED')
      ORDER BY b.start_date ASC
      LIMIT 5
    `, [buyerId]);

    // Wishlist
    const wishlist = await pool.query(`
      SELECT 
        l.*,
        c.name as category_name,
        c.icon as category_icon,
        AVG(r.overall_rating) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM wishlists w
      JOIN listings l ON w.listing_id = l.id
      JOIN categories c ON l.category_id = c.id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE w.user_id = $1
      GROUP BY l.id, c.id
    `, [buyerId]);

    res.json({
      success: true,
      data: {
        stats: stats.rows[0] || {
          total_bookings: 0,
          total_spent: 0,
          active_bookings: 0,
          completed_bookings: 0,
          cancelled_bookings: 0,
          pending_bookings: 0
        },
        upcomingBookings: upcomingBookings.rows,
        wishlist: wishlist.rows
      }
    });

  } catch (error) {
    console.error("Buyer stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch buyer stats"
    });
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { listingId } = req.body;
    const userId = req.user.id;

    await pool.query(
      'INSERT INTO wishlists (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, listingId]
    );

    res.json({
      success: true,
      message: "Added to wishlist"
    });

  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add to wishlist"
    });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { listingId } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM wishlists WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );

    res.json({
      success: true,
      message: "Removed from wishlist"
    });

  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist"
    });
  }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await pool.query(`
      SELECT 
        l.*,
        c.name as category_name,
        c.icon as category_icon,
        AVG(r.overall_rating) as avg_rating
      FROM wishlists w
      JOIN listings l ON w.listing_id = l.id
      JOIN categories c ON l.category_id = c.id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE w.user_id = $1
      GROUP BY l.id, c.id
    `, [userId]);

    res.json({
      success: true,
      data: wishlist.rows
    });

  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist"
    });
  }
};