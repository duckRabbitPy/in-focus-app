-- Delete existing test data
DELETE FROM photo_tags;
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
    '$2b$12$FTlQd8u22rD.DDQ0IN2jt.2cAkpCQ7hkfsHIX4vstoAjSwEa7sh3m'
);

