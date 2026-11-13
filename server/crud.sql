USE wearithm_20407;
SET NAMES utf8mb4;

INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id)
VALUES ('test@sunrin.hs.kr', '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre',
        '테스트', '010-9999-0000', 2025, '20499');

INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id)
VALUES ('test2@sunrin.hs.kr', '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre',
        '후배', '010-9999-0001', 2026, '10101');

SELECT id, email, nickname, phone_number, entry_year, student_id, created_at
FROM users WHERE email = 'test@sunrin.hs.kr';

UPDATE users SET nickname = '테스트2', phone_number = '010-9999-1111'
WHERE email = 'test@sunrin.hs.kr';

SELECT id, nickname, phone_number FROM users WHERE email = 'test@sunrin.hs.kr';

INSERT INTO posts (seller_id, title, description, category, size, fabric, texture,
                   item_condition, trade_type, price, location, image_url)
VALUES (1, '동복 재킷 100 나눔', '1년 입었어요. 깨끗해요.', '교복상의', '100', '울', '두꺼움',
        'A', 'FREE', 0, '본관 1층 로비', '/uploads/jacket.jpg');

INSERT INTO posts (seller_id, title, description, category, size, fabric, texture,
                   item_condition, trade_type, price, location)
VALUES (1, '체육복 바지 M', '무릎 조금 늘어남', '체육복', 'M', '폴리에스터', '부드러움',
        'B', 'SELL', 3000, '체육관 앞');

SELECT id, title, category, size, trade_type, price, status, created_at
FROM posts ORDER BY created_at DESC;

SELECT id, title FROM posts WHERE category = '체육복';
SELECT id, title FROM posts WHERE title LIKE '%재킷%';
SELECT * FROM posts WHERE id = 1;

UPDATE posts SET price = 2000, description = '무릎 조금 늘어남. 가격 내림'
WHERE id = 2 AND seller_id = 1;

UPDATE posts SET title = '남이 고침'
WHERE id = 2 AND seller_id = 2;

SELECT id, title, price FROM posts WHERE id = 2;

DELETE FROM posts WHERE id = 2 AND seller_id = 1;
SELECT * FROM posts WHERE id = 2;

INSERT INTO trades (post_id, requester_id, message)
VALUES (1, 2, '입학 전에 받고 싶어요!');

UPDATE trades SET status = 'ACCEPTED' WHERE id = 1;
UPDATE posts  SET status = 'RESERVED' WHERE id = 1;

UPDATE trades SET status = 'COMPLETED', completed_at = NOW() WHERE id = 1;
UPDATE posts  SET status = 'COMPLETED' WHERE id = 1;

SELECT p.id, p.title, p.category, p.size, u.nickname AS 올린_사람, p.status
FROM posts p
LEFT JOIN users u ON u.id = p.seller_id
ORDER BY p.created_at DESC;

SELECT p.title       AS 옷,
       p.category    AS 카테고리,
       s.nickname    AS 보낸_사람,
       r.nickname    AS 받은_사람,
       t.completed_at AS 물려준_날
FROM trades t
JOIN posts p      ON p.id = t.post_id
LEFT JOIN users s ON s.id = p.seller_id
LEFT JOIN users r ON r.id = t.requester_id
WHERE t.status = 'COMPLETED'
ORDER BY t.completed_at DESC;

DELETE FROM users WHERE email = 'test@sunrin.hs.kr';
SELECT * FROM users WHERE email = 'test@sunrin.hs.kr';

SELECT p.title, s.nickname AS 보낸_사람, r.nickname AS 받은_사람
FROM trades t
JOIN posts p      ON p.id = t.post_id
LEFT JOIN users s ON s.id = p.seller_id
LEFT JOIN users r ON r.id = t.requester_id;
