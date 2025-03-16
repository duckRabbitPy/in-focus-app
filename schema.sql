-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS rolls;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS photo_tags;
DROP TABLE IF EXISTS lenses;

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags table
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Lens table
CREATE TABLE lenses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name)
);

-- Rolls table
CREATE TABLE rolls (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    film_type VARCHAR(255),
    iso INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photos table
CREATE TABLE photos (
    id SERIAL PRIMARY KEY,
    roll_id INTEGER NOT NULL REFERENCES rolls(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    photo_url TEXT,
    f_stop DECIMAL(3,1),
    focal_distance VARCHAR(50), -- Can be a number or 'infinity'
    shutter_speed VARCHAR(10),
    exposure_value DECIMAL(4,1),
    phone_light_meter VARCHAR(10),
    stabilisation VARCHAR(50),
    timer BOOLEAN DEFAULT false,
    flash BOOLEAN DEFAULT false,
    exposure_memory BOOLEAN DEFAULT false,
    notes TEXT,
    sequence_number INTEGER NOT NULL, -- To maintain photo order in roll
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Photo tags table
CREATE TABLE photo_tags (
    photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (photo_id, tag_id)
);

CREATE TABLE photo_lenses (
    photo_id INTEGER NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    lens_id INTEGER NOT NULL REFERENCES lenses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (photo_id, lens_id)
);

-- Indexes for better query performance
CREATE INDEX idx_rolls_user_id ON rolls(user_id);
CREATE INDEX idx_photos_roll_id ON photos(roll_id);
CREATE INDEX idx_photos_sequence ON photos(roll_id, sequence_number);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_lenses_user_id ON lenses(user_id);

CREATE INDEX idx_photo_lenses_lens_id ON photo_lenses(lens_id);
CREATE INDEX idx_photo_lenses_photo_id ON photo_lenses(photo_id);
CREATE INDEX idx_photo_tags_tag_id ON photo_tags(tag_id);
CREATE INDEX idx_photo_tags_photo_id ON photo_tags(photo_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rolls_updated_at
    BEFORE UPDATE ON rolls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON tags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 

CREATE TRIGGER update_lenses_updated_at
    BEFORE UPDATE ON lenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();