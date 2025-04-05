-- Delete existing test data
DELETE FROM photo_tags;
DELETE FROM photo_lenses;
DELETE FROM photos;
DELETE FROM rolls;
DELETE FROM tags;
DELETE FROM lenses;
DELETE FROM users;

-- Reset sequences for all tables with serial IDs
SELECT setval('tags_id_seq', COALESCE((SELECT MAX(id) FROM tags), 0) + 1);
SELECT setval('rolls_id_seq', COALESCE((SELECT MAX(id) FROM rolls), 0) + 1);
SELECT setval('photos_id_seq', COALESCE((SELECT MAX(id) FROM photos), 0) + 1);
SELECT setval('lenses_id_seq', COALESCE((SELECT MAX(id) FROM lenses), 0) + 1);



-- Insert test user
INSERT INTO users (id, username, password_hash)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'testuser',
    '$TEST_USER_HASHED_PASSWORD_PLACEHOLDER'
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

-- Insert test lenses
INSERT INTO lenses (id, user_id, name) VALUES
    (1, '123e4567-e89b-12d3-a456-426614174000', 'Canon 50mm f/1.8'),
    (2, '123e4567-e89b-12d3-a456-426614174000', 'Canon 24-70mm f/2.8'),
    (3, '123e4567-e89b-12d3-a456-426614174000', 'Nikon 50mm f/1.8');

-- Insert test rolls
INSERT INTO rolls (id, user_id, name, film_type, iso)
VALUES (
    1,
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Roll 1',
    'Kodak Portra',
    400
);

INSERT INTO rolls (id, user_id, name, film_type, iso)
VALUES (
    2,
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Roll 2',
    'Fujifilm Pro 400H',
    200
);

INSERT INTO rolls (id, user_id, name, film_type, iso)
VALUES (
    3,
    '123e4567-e89b-12d3-a456-426614174000',
    'Test Roll 3',
    'Ilford HP5 Plus',
    400
);



-- [SCRIPT INSERT TEST PHOTOS]

-- Update sequences for all tables with serial IDs

-- [SCRIPT INSERT SEQUENCE VALUES]

SELECT setval('tags_id_seq', 10);
SELECT setval('lenses_id_seq', 3);

