const pool = require("../config/db");

// Get all categories
const getCategories = async () => {
  const result = await pool.query('SELECT * FROM categories ORDER BY name');
  return result.rows;
};

// Create listing
const createListing = async (data) => {
  const { 
    title, description, price, owner_id, category_id,
    location, city, address
  } = data;

  const result = await pool.query(
    `INSERT INTO listings (
      title, description, price, owner_id, category_id,
      location, city, address, availability, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *`,
    [
      title, description, price, owner_id, category_id,
      location || null, city || null, address || null, true
    ]
  );

  return result.rows[0];
};

// Get listing by ID
const getListingById = async (id) => {
  const result = await pool.query(
    `SELECT l.*, c.name as category_name, c.icon as category_icon,
            u.name as owner_name, u.email as owner_email,
            COALESCE(AVG(r.overall_rating), 0) as avg_rating,
            COUNT(DISTINCT r.id) as review_count
     FROM listings l
     LEFT JOIN categories c ON l.category_id = c.id
     LEFT JOIN users u ON l.owner_id = u.id
     LEFT JOIN reviews r ON l.id = r.listing_id
     WHERE l.id = $1
     GROUP BY l.id, c.id, u.id`,
    [id]
  );

  if (result.rows.length > 0) {
    await pool.query('UPDATE listings SET views_count = views_count + 1 WHERE id = $1', [id]);
  }

  return result.rows[0];
};

// Get listings by owner
const getListingsByOwner = async (ownerId) => {
  const result = await pool.query(
    `SELECT l.*, c.name as category_name,
            COUNT(b.id) as total_bookings,
            COALESCE(SUM(b.total_price), 0) as total_earnings
     FROM listings l
     LEFT JOIN categories c ON l.category_id = c.id
     LEFT JOIN bookings b ON l.id = b.listing_id
     WHERE l.owner_id = $1
     GROUP BY l.id, c.id
     ORDER BY l.created_at DESC`,
    [ownerId]
  );

  return result.rows;
};

// Search listings
const searchListings = async (filters) => {
  const { query, category, location, minPrice, maxPrice, sortBy = 'created_at DESC' } = filters;

  let sql = `
    SELECT l.*, c.name as category_name, c.icon as category_icon,
           COALESCE(AVG(r.overall_rating), 0) as avg_rating,
           COUNT(DISTINCT r.id) as review_count
    FROM listings l
    JOIN categories c ON l.category_id = c.id
    LEFT JOIN reviews r ON l.id = r.listing_id
    WHERE l.availability = true
  `;

  const values = [];
  let paramIndex = 1;

  if (query && query.trim()) {
    sql += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`;
    values.push(`%${query}%`);
    paramIndex++;
  }

  if (category && category.trim()) {
    sql += ` AND c.name = $${paramIndex}`;
    values.push(category);
    paramIndex++;
  }

  if (location && location.trim()) {
    sql += ` AND (l.city ILIKE $${paramIndex} OR l.location ILIKE $${paramIndex})`;
    values.push(`%${location}%`);
    paramIndex++;
  }

  if (minPrice && !isNaN(minPrice)) {
    sql += ` AND l.price >= $${paramIndex}`;
    values.push(parseFloat(minPrice));
    paramIndex++;
  }

  if (maxPrice && !isNaN(maxPrice)) {
    sql += ` AND l.price <= $${paramIndex}`;
    values.push(parseFloat(maxPrice));
    paramIndex++;
  }

  sql += ` GROUP BY l.id, c.id`;

  switch(sortBy) {
    case 'price_low':
      sql += ` ORDER BY l.price ASC`;
      break;
    case 'price_high':
      sql += ` ORDER BY l.price DESC`;
      break;
    default:
      sql += ` ORDER BY l.created_at DESC`;
  }

  const result = await pool.query(sql, values);
  return result.rows;
};

// Toggle availability
const toggleAvailability = async (id, ownerId) => {
  const result = await pool.query(
    `UPDATE listings SET availability = NOT availability, updated_at = NOW()
     WHERE id = $1 AND owner_id = $2
     RETURNING *`,
    [id, ownerId]
  );
  return result.rows[0];
};

// Update listing
const updateListing = async (id, ownerId, data) => {
  const { title, description, price, location, city, address } = data;

  const result = await pool.query(
    `UPDATE listings
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         price = COALESCE($3, price),
         location = COALESCE($4, location),
         city = COALESCE($5, city),
         address = COALESCE($6, address),
         updated_at = NOW()
     WHERE id = $7 AND owner_id = $8
     RETURNING *`,
    [title, description, price, location, city, address, id, ownerId]
  );

  return result.rows[0];
};

// Delete listing
const deleteListing = async (id, ownerId) => {
  const result = await pool.query(
    'DELETE FROM listings WHERE id = $1 AND owner_id = $2 RETURNING id',
    [id, ownerId]
  );
  return result.rows[0];
};

// Export all functions
module.exports = {
  getCategories,
  createListing,
  getListingById,
  getListingsByOwner,
  searchListings,
  toggleAvailability,
  updateListing,
  deleteListing
};