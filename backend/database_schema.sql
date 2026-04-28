-- TravelAI Tamil Nadu - PostgreSQL Schema for Neon DB
-- Run this script in Neon Console or via psql

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attractions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    category VARCHAR(100),
    rating FLOAT,
    description TEXT,
    address VARCHAR(500),
    opening_hours VARCHAR(100),
    district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itineraries (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    summary TEXT,
    green_score FLOAT,
    total_cost VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_items (
    id SERIAL PRIMARY KEY,
    itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    time_of_day VARCHAR(50),
    attraction_id INTEGER REFERENCES attractions(id),
    activity_name VARCHAR(255),
    notes TEXT,
    latitude FLOAT,
    longitude FLOAT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_attractions_district ON attractions(district);
CREATE INDEX IF NOT EXISTS idx_attractions_category ON attractions(category);
CREATE INDEX IF NOT EXISTS idx_itineraries_user ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_created ON itineraries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_itinerary_items_itinerary ON itinerary_items(itinerary_id);

-- Insert sample Chennai attractions
INSERT INTO attractions (name, latitude, longitude, category, rating, description, district) VALUES
('Marina Beach', 13.0569, 80.2824, 'Beach', 4.6, 'One of the longest urban beaches in the world, stretching along the Bay of Bengal', 'Chennai'),
('Meenakshi Amman Temple', 9.9195, 78.1193, 'Temple', 4.8, 'Historic Hindu temple dedicated to Goddess Meenakshi', 'Madurai'),
('Brihadeeswarar Temple', 10.7828, 79.1318, 'Temple', 4.9, 'UNESCO World Heritage site built by the Chola dynasty', 'Thanjavur'),
('Shore Temple', 12.6172, 80.1992, 'Temple', 4.7, 'Ancient Pallava-era temple on the shores of the Bay of Bengal', 'Mahabalipuram'),
('Mahabalipuram Shore Temple', 12.6172, 80.1992, 'Heritage', 4.7, '8th century stone carvings and temples', 'Mahabalipuram'),
('Vivekananda House', 12.9825, 80.2621, 'Museum', 4.5, 'Historic building where Swami Vivekananda stayed in 1893', 'Chennai'),
('Fort St. George', 13.0817, 80.2925, 'Fort', 4.4, 'First English fortress in India, built in 1644', 'Chennai'),
('Kapaleeshwarar Temple', 13.0365, 80.2569, 'Temple', 4.7, '6th century Shaivism temple with stunning architecture', 'Chennai'),
('San Thome Basilica', 13.0337, 80.2614, 'Church', 4.6, 'Basilica built over the tomb of St. Thomas the Apostle', 'Chennai'),
('Government Museum', 13.0761, 80.2603, 'Museum', 4.4, 'One of the oldest museums in India with ancient artifacts', 'Chennai')
ON CONFLICT DO NOTHING;