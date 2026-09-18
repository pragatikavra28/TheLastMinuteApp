-- ============================================
-- COMPLETE DATABASE SCHEMA FOR LASTMINUTE APP
-- ============================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'seller', 'admin')),
    phone VARCHAR(20),
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(20) DEFAULT 'UNVERIFIED',
    primary_document_id INTEGER,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    label VARCHAR(50),
    icon VARCHAR(20),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, label, icon, description) VALUES
('hotel', 'Hotels', '🏨', 'Hotel and accommodation booking'),
('movie', 'Movies', '🎬', 'Movie tickets and shows'),
('concert', 'Concerts', '🎤', 'Concerts and live events'),
('restaurant', 'Restaurants', '🍽️', 'Restaurant table booking'),
('service', 'Services', '🔧', 'Professional services')
ON CONFLICT (name) DO NOTHING;

-- LISTINGS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    availability BOOLEAN DEFAULT TRUE,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id),
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(50),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    phone VARCHAR(20),
    email VARCHAR(100),
    images TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    rules TEXT[] DEFAULT '{}',
    cancellation_policy TEXT,
    min_booking_days INTEGER DEFAULT 1,
    max_booking_days INTEGER DEFAULT 30,
    instant_book BOOLEAN DEFAULT TRUE,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- LISTING DETAILS (Type-specific fields)
CREATE TABLE IF NOT EXISTS listing_details (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE UNIQUE,
    
    -- Common fields
    max_guests INTEGER DEFAULT 1,
    
    -- Hotel specific
    hotel_type VARCHAR(50), -- luxury, premium, standard, budget, boutique
    ac_non_ac VARCHAR(20), -- ac, non-ac, both
    bedrooms INTEGER,
    bathrooms INTEGER,
    bed_type VARCHAR(50),
    check_in_time TIME DEFAULT '14:00',
    check_out_time TIME DEFAULT '11:00',
    nearby_places TEXT[],
    
    -- Restaurant specific
    cuisine_type VARCHAR(100),
    opening_time TIME,
    closing_time TIME,
    seating_capacity INTEGER,
    avg_cost_for_two DECIMAL(10,2),
    has_outdoor_seating BOOLEAN DEFAULT FALSE,
    has_home_delivery BOOLEAN DEFAULT FALSE,
    nearby_landmarks TEXT[],
    average_meal_time INTEGER,
    
    -- Movie/Theater specific
    movie_name VARCHAR(255),
    show_date DATE,
    show_time TIME,
    theater_name VARCHAR(255),
    screen_number VARCHAR(50),
    seat_layout VARCHAR(50), -- standard, recliner, luxury, sofa
    seat_categories JSONB, -- [{name, priceMultiplier, availableSeats}]
    language VARCHAR(50),
    certification VARCHAR(10),
    duration INTEGER,
    genre VARCHAR(100),
    
    -- Concert specific
    performer_name VARCHAR(255),
    concert_date DATE,
    concert_time TIME,
    venue VARCHAR(255),
    gate_open_time TIME,
    age_restriction INTEGER DEFAULT 0,
    nearby_hotels TEXT[],
    parking_available BOOLEAN DEFAULT TRUE,
    
    -- Common event fields
    total_seats INTEGER,
    row_data JSONB,
    seat_selection BOOLEAN DEFAULT FALSE,
    
    -- Service specific
    service_duration INTEGER,
    service_area VARCHAR(255),
    certifications TEXT[],
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS TABLE (Enhanced)
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    booking_reference VARCHAR(20) UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    booking_type VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    time_slot TIME,
    number_of_guests INTEGER DEFAULT 1,
    special_requests TEXT,
    seat_numbers TEXT[] DEFAULT '{}',
    seat_category VARCHAR(100),
    base_price DECIMAL(10,2) NOT NULL,
    taxes DECIMAL(10,2) DEFAULT 0,
    service_fee DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW')),
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'REFUNDED', 'FAILED')),
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generate booking reference trigger
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
    NEW.booking_reference = 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEW.id::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_booking_reference
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION generate_booking_reference();

-- AVAILABILITY SLOTS (For time-based bookings)
CREATE TABLE IF NOT EXISTS availability_slots (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    available BOOLEAN DEFAULT TRUE,
    max_capacity INTEGER,
    booked_count INTEGER DEFAULT 0,
    price_multiplier DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(listing_id, date, start_time)
);

-- REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    reviewer_id INTEGER REFERENCES users(id),
    listing_id INTEGER REFERENCES listings(id),
    
    -- Ratings
    overall_rating DECIMAL(2,1) CHECK (overall_rating >= 1 AND overall_rating <= 5),
    cleanliness DECIMAL(2,1) CHECK (cleanliness >= 1 AND cleanliness <= 5),
    communication DECIMAL(2,1) CHECK (communication >= 1 AND communication <= 5),
    accuracy DECIMAL(2,1) CHECK (accuracy >= 1 AND accuracy <= 5),
    location_rating DECIMAL(2,1) CHECK (location_rating >= 1 AND location_rating <= 5),
    value_for_money DECIMAL(2,1) CHECK (value_for_money >= 1 AND value_for_money <= 5),
    
    comment TEXT,
    host_reply TEXT,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WISHLISTS TABLE
CREATE TABLE IF NOT EXISTS wishlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, listing_id)
);

-- MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50),
    title VARCHAR(255),
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'stripe',
    payment_intent_id VARCHAR(255),
    transaction_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOCUMENT VERIFICATION TABLES
CREATE TABLE IF NOT EXISTS user_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    date_of_birth DATE,
    country_of_issue VARCHAR(100),
    expiry_date DATE,
    front_image_url TEXT NOT NULL,
    back_image_url TEXT,
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id),
    rejection_reason TEXT,
    ocr_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, document_number, verification_status)
);

-- Booking Verification Table
CREATE TABLE IF NOT EXISTS booking_verifications (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES user_documents(id),
    guest_name VARCHAR(200) NOT NULL,
    guest_document_number VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRIGGER FOR DOCUMENT VERIFICATION
-- ============================================

CREATE OR REPLACE FUNCTION deactivate_old_verified_documents()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.verification_status = 'VERIFIED' THEN
        UPDATE user_documents 
        SET verification_status = 'INACTIVE',
            updated_at = NOW()
        WHERE user_id = NEW.user_id 
          AND id != NEW.id 
          AND verification_status = 'VERIFIED';
        
        UPDATE users 
        SET verification_status = 'VERIFIED',
            primary_document_id = NEW.id,
            verified_at = NOW(),
            updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_deactivate_old_documents ON user_documents;
CREATE TRIGGER trigger_deactivate_old_documents
    AFTER INSERT OR UPDATE OF verification_status ON user_documents
    FOR EACH ROW
    EXECUTE FUNCTION deactivate_old_verified_documents();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_verification ON users(verification_status);
CREATE INDEX IF NOT EXISTS idx_listings_owner ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(city, country);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_availability ON listings(availability);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_intent ON payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user ON user_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_status ON user_documents(verification_status);
CREATE INDEX IF NOT EXISTS idx_booking_verifications_booking ON booking_verifications(booking_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_listing ON availability_slots(listing_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date ON availability_slots(date);
CREATE INDEX IF NOT EXISTS idx_reviews_listing ON reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_documents_user_status ON user_documents(user_id, verification_status);

-- ============================================
-- FUNCTIONS AND VIEWS
-- ============================================

CREATE OR REPLACE FUNCTION can_user_book(user_id INTEGER, required_guests INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
    verified_docs_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO verified_docs_count
    FROM user_documents
    WHERE user_id = $1 
      AND verification_status = 'VERIFIED';
    
    RETURN verified_docs_count >= required_guests;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW verified_users_with_docs AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    u.verification_status as user_verification_status,
    u.verified_at as user_verified_at,
    d.id as document_id,
    d.document_type,
    d.document_number,
    d.full_name as document_full_name,
    d.verification_status as document_verification_status,
    d.verified_at as document_verified_at
FROM users u
LEFT JOIN user_documents d ON u.id = d.user_id AND d.verification_status = 'VERIFIED'
WHERE u.verification_status = 'VERIFIED';

CREATE OR REPLACE FUNCTION get_user_verified_documents_count(user_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    doc_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO doc_count
    FROM user_documents
    WHERE user_id = $1 
      AND verification_status = 'VERIFIED';
    
    RETURN doc_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION TO GET SELLER DASHBOARD STATS
-- ============================================

CREATE OR REPLACE FUNCTION get_seller_dashboard_stats(seller_id INTEGER)
RETURNS TABLE (
    total_listings BIGINT,
    active_listings BIGINT,
    total_bookings BIGINT,
    pending_bookings BIGINT,
    confirmed_bookings BIGINT,
    completed_bookings BIGINT,
    cancelled_bookings BIGINT,
    total_revenue NUMERIC,
    avg_rating NUMERIC,
    completion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT l.id) as total_listings,
        COUNT(DISTINCT CASE WHEN l.availability = true THEN l.id END) as active_listings,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'PENDING' THEN b.id END) as pending_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'CONFIRMED' THEN b.id END) as confirmed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'COMPLETED' THEN b.id END) as completed_bookings,
        COUNT(DISTINCT CASE WHEN b.status = 'CANCELLED' THEN b.id END) as cancelled_bookings,
        COALESCE(SUM(b.total_price), 0) as total_revenue,
        COALESCE(AVG(r.overall_rating), 0) as avg_rating,
        CASE 
            WHEN COUNT(DISTINCT b.id) > 0 
            THEN ROUND((COUNT(DISTINCT CASE WHEN b.status IN ('COMPLETED', 'CONFIRMED') THEN b.id END)::DECIMAL / COUNT(DISTINCT b.id)::DECIMAL) * 100, 1)
            ELSE 0
        END as completion_rate
    FROM listings l
    LEFT JOIN bookings b ON l.id = b.listing_id
    LEFT JOIN reviews r ON l.id = r.listing_id
    WHERE l.owner_id = seller_id;
END;
$$ LANGUAGE plpgsql;