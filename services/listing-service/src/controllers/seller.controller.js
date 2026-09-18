const pool = require("../config/db");

// Get seller dashboard stats
exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const stats = await pool.query(`
      SELECT 
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(SUM(b.total_price), 0) as total_earnings,
        COALESCE(AVG(r.overall_rating), 0) as avg_rating,
        COUNT(DISTINCT CASE WHEN b.status = 'PENDING' THEN b.id END) as pending_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'CONFIRMED' THEN b.id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END) as completed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'CANCELLED' THEN b.id END) as cancelled_bookings
      FROM listings l
      LEFT JOIN bookings b ON l.id = b.listing_id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE l.owner_id = $1
    `, [sellerId]);

    const recentBookings = await pool.query(`
      SELECT 
        b.*,
        l.title,
        u.name as buyer_name,
        u.email as buyer_email
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      JOIN users u ON b.user_id = u.id
      WHERE l.owner_id = $1
      ORDER BY b.created_at DESC
      LIMIT 10
    `, [sellerId]);

    const earningsByMonth = await pool.query(`
      SELECT 
        DATE_TRUNC('month', b.created_at) as month,
        EXTRACT(YEAR FROM b.created_at) as year,
        EXTRACT(MONTH FROM b.created_at) as month_num,
        COALESCE(SUM(b.total_price), 0) as earnings,
        COUNT(b.id) as booking_count
      FROM bookings b
      JOIN listings l ON b.listing_id = l.id
      WHERE l.owner_id = $1 AND b.status = 'CONFIRMED'
      GROUP BY month, year, month_num
      ORDER BY month DESC
      LIMIT 12
    `, [sellerId]);

    res.json({
      success: true,
      data: {
        stats: stats.rows[0] || {
          total_listings: 0,
          total_bookings: 0,
          total_earnings: 0,
          avg_rating: 0,
          pending_bookings: 0,
          confirmed_bookings: 0,
          completed_bookings: 0,
          cancelled_bookings: 0
        },
        recentBookings: recentBookings.rows,
        earningsByMonth: earningsByMonth.rows
      }
    });

  } catch (error) {
    console.error("Seller stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller stats"
    });
  }
};

// Get seller listings with stats
exports.getSellerListings = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const listings = await pool.query(`
      SELECT 
        l.*,
        c.name as category_name,
        COUNT(DISTINCT b.id) as total_bookings,
        COALESCE(SUM(b.total_price), 0) as total_earnings,
        COALESCE(AVG(r.overall_rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count
      FROM listings l
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN bookings b ON l.id = b.listing_id
      LEFT JOIN reviews r ON l.id = r.listing_id
      WHERE l.owner_id = $1
      GROUP BY l.id, c.id
      ORDER BY l.created_at DESC
    `, [sellerId]);

    res.json({
      success: true,
      data: listings.rows
    });

  } catch (error) {
    console.error("Seller listings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch seller listings"
    });
  }
};