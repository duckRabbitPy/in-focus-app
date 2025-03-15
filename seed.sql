-- Delete existing test data if it exists
DELETE FROM photos;
DELETE FROM rolls;
DELETE FROM users WHERE username = 'testuser';

-- Insert a test user
INSERT INTO users (id, username, password_hash, created_at)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'testuser',
  '$2b$12$FTlQd8u22rD.DDQ0IN2jt.2cAkpCQ7hkfsHIX4vstoAa7sh3m',  -- This is a hashed version of 'password123'
  CURRENT_TIMESTAMP
);

-- Insert two rolls for the test user with explicit IDs
INSERT INTO rolls (id, user_id, name, film_type, iso, created_at)
VALUES
  (1, '123e4567-e89b-12d3-a456-426614174000', 'Street Photography', 'Kodak Portra', 400, CURRENT_TIMESTAMP),
  (2, '123e4567-e89b-12d3-a456-426614174000', 'Nature Walk', 'Fujifilm Pro 400H', 400, CURRENT_TIMESTAMP);

-- Update the sequence to start after our explicit IDs
SELECT setval('rolls_id_seq', (SELECT MAX(id) FROM rolls));

-- Insert 3 photos for the first roll (roll_id = 1)
INSERT INTO photos (
  roll_id,
  sequence_number,
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
  created_at
)
VALUES
  (1, 1, 'Street Corner', 'https://example.com/photo1.jpg', 2.8, '1m', '1/125', 0, '1/125', 'handheld', false, false, true, 'Busy intersection during rush hour. Good light from setting sun.', CURRENT_TIMESTAMP),
  (1, 2, 'Coffee Shop', 'https://example.com/photo2.jpg', 4.0, '2m', '1/60', -1, '1/60', 'handheld', false, false, false, 'Interior shot through window. Challenging lighting conditions.', CURRENT_TIMESTAMP),
  (1, 3, 'Street Art', 'https://example.com/photo3.jpg', 5.6, '3m', '1/250', 1, '1/250', 'tripod', false, false, true, 'Large mural on brick wall. Used tripod for precise framing.', CURRENT_TIMESTAMP);

-- Insert 3 photos for the second roll (roll_id = 2)
INSERT INTO photos (
  roll_id,
  sequence_number,
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
  created_at
)
VALUES
  (2, 1, 'Forest Path', 'https://example.com/photo4.jpg', 8.0, '5m', '1/60', 0, '1/60', 'handheld', true, false, true, 'Early morning shot in dense forest. Used timer to avoid camera shake.', CURRENT_TIMESTAMP),
  (2, 2, 'Waterfall', 'https://example.com/photo5.jpg', 11.0, 'infinity', '1/125', 1, '1/125', 'tripod', false, false, true, 'Long exposure of waterfall. Small aperture for maximum depth of field.', CURRENT_TIMESTAMP),
  (2, 3, 'Wildflowers', 'https://example.com/photo6.jpg', 2.8, '30cm', '1/500', -1, '1/500', 'handheld', false, false, false, 'Close-up of purple wildflowers. Wide aperture for background blur.', CURRENT_TIMESTAMP); 