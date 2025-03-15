-- Delete existing test data
DELETE FROM photo_tags;
DELETE FROM photos;
DELETE FROM rolls;
DELETE FROM tags;
DELETE FROM users;

-- Insert test user
INSERT INTO users (id, username, password_hash)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'testuser',
    '$2b$10$6bEwGpqvKXxsICRz0e.Pn.Cn.YX2qYgm5DqgGGNFEqNVe3ZYnfh2e'
);

-- Insert test tags
INSERT INTO tags (id, user_id, name) VALUES
    (1, '123e4567-e89b-12d3-a456-426614174000', 'portrait'),
    (2, '123e4567-e89b-12d3-a456-426614174000', 'landscape'),
    (3, '123e4567-e89b-12d3-a456-426614174000', 'street'),
    (4, '123e4567-e89b-12d3-a456-426614174000', 'architecture'),
    (5, '123e4567-e89b-12d3-a456-426614174000', 'nature'),
    (6, '123e4567-e89b-12d3-a456-426614174000', 'night'),
    (7, '123e4567-e89b-12d3-a456-426614174000', 'macro'),
    (8, '123e4567-e89b-12d3-a456-426614174000', 'urban'),
    (9, '123e4567-e89b-12d3-a456-426614174000', 'experimental'),
    (10, '123e4567-e89b-12d3-a456-426614174000', 'black and white');

-- Insert test roll
INSERT INTO rolls (id, user_id, name, film_type, iso)
VALUES (
    1,
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Roll 1',
    'Kodak Portra',
    400
);

-- Insert test photos
INSERT INTO photos (
    id,
    roll_id,
    subject,
    photo_url,
    f_stop,
    focal_distance,
    shutter_speed,
    exposure_value,
    phone_light_meter,
    stabilisation,
    timer,
    flash,
    exposure_memory,
    notes,
    sequence_number
) VALUES
    (1, 1, 'City Building', 'https://example.com/photo1.jpg', 5.6, '10m', '1/125', 0, 'sunny', 'tripod', false, false, true, 'Test photo 1', 1),
    (2, 1, 'Street Scene', 'https://example.com/photo2.jpg', 8, '5m', '1/250', 1, 'sunny', 'handheld', false, false, false, 'Test photo 2', 2),
    (3, 1, 'Night Sky', 'https://example.com/photo3.jpg', 2.8, 'infinity', '1/30', -2, 'dark', 'tripod', true, false, true, 'Test photo 3', 3);

-- Insert photo-tag associations
INSERT INTO photo_tags (photo_id, tag_id) VALUES
    -- City Building photo tags
    (1, 4),  -- architecture
    (1, 8),  -- urban
    
    -- Street Scene photo tags
    (2, 3),  -- street
    (2, 8),  -- urban
    (2, 10), -- black and white
    
    -- Night Sky photo tags
    (3, 6),  -- night
    (3, 9);  -- experimental 