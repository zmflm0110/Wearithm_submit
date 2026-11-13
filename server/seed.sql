USE wearithm_20407;
SET NAMES utf8mb4;

INSERT INTO users (id, email, password, nickname, phone_number, entry_year, student_id) VALUES
  (1, 'minjun@sunrin.hs.kr',  '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre', '민준', '010-1111-0001', 2024, '30301'),
  (2, 'seoyeon@sunrin.hs.kr', '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre', '서연', '010-1111-0002', 2024, '30412'),
  (3, 'jiho@sunrin.hs.kr',    '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre', '지호', '010-1111-0003', 2025, '20205'),
  (4, 'hayun@sunrin.hs.kr',   '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre', '하윤', '010-1111-0004', 2025, '20418'),
  (5, 'yuna@sunrin.hs.kr',    '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre', '유나', '010-1111-0005', 2026, '10109'),
  (6, 'siwoo@sunrin.hs.kr',   '$2b$10$QyQQGmxr7HNyKDp3oQTSsem5APokOIM4iaX8nNyU43GGJ0WMqOHre', '시우', '010-1111-0006', 2026, '10322');

INSERT INTO posts (id, seller_id, title, description, category, size, fabric, texture, item_condition, trade_type, price, location, image_url, status) VALUES
  (1, 1, '체육복 상하의 95 나눔', '졸업해서 물려줘요. 무릎 멀쩡해요.', '체육복', '95', '폴리에스터', '매끈함', 'A', 'FREE', 0, '체육관 앞', '/uploads/seed/gym-navy.svg', 'COMPLETED'),
  (2, 2, '동복 재킷 100', '2년 입었고 드라이 맡겨뒀어요.', '외투', '100', '울 혼방', '도톰함', 'B', 'SELL', 10000, '본관 1층 로비', '/uploads/seed/coat-black.svg', 'COMPLETED'),
  (3, 1, '하복 셔츠 95 두 벌', '한 벌은 거의 새것이에요.', '교복상의', '95', '면 혼방', '얇음', 'A', 'FREE', 0, '2층 도서관 앞', '/uploads/seed/shirt-white.svg', 'RESERVED'),
  (4, 2, '교복 바지 30인치', '기장 줄이지 않았어요.', '교복하의', '30인치', '폴리에스터', '매끈함', 'B', 'SELL', 5000, '본관 1층 로비', '/uploads/seed/pants-navy.svg', 'SELLING'),
  (5, 3, '생활복 반팔 M', '한 학기 입었어요.', '생활복', 'M', '면', '부드러움', 'A', 'FREE', 0, '급식실 앞', '/uploads/seed/polo-sky.svg', 'SELLING'),
  (6, 4, '체육복 세트 100', '목 부분 조금 늘어났어요.', '체육복', '100', '폴리에스터', '매끈함', 'C', 'FREE', 0, '체육관 앞', '/uploads/seed/gym-green.svg', 'SELLING'),
  (7, 3, '동복 셔츠 100', '빳빳하게 다려 둘게요.', '교복상의', '100', '면 혼방', '빳빳함', 'B', 'SELL', 3000, '3층 계단', '/uploads/seed/shirt-blue.svg', 'SELLING'),
  (8, 1, '롱패딩 L', '겨울에 따뜻해요. 지퍼 튼튼.', '외투', 'L', '나일론', '바스락', 'B', 'SELL', 15000, '본관 1층 로비', '/uploads/seed/coat-camel.svg', 'COMPLETED'),
  (9, 4, '니트 조끼 95', '보풀 제거해 뒀어요.', '교복상의', '95', '아크릴', '포근함', 'B', 'FREE', 0, '2층 도서관 앞', '/uploads/seed/vest-navy.svg', 'SELLING'),
  (10, 5, '생활복 긴팔 L', '입학하고 크게 샀는데 안 맞아요.', '생활복', 'L', '면', '부드러움', 'A', 'SELL', 4000, '급식실 앞', '/uploads/seed/polo-white.svg', 'SELLING');

INSERT INTO trades (post_id, requester_id, message, status, created_at, completed_at) VALUES
  (1, 3, '체육복 필요했어요!', 'COMPLETED', '2026-03-02 10:00:00', '2026-03-04 12:30:00'),
  (2, 4, '재킷 사고 싶어요.', 'COMPLETED', '2026-03-10 09:00:00', '2026-03-12 16:00:00'),
  (8, 5, '패딩 받고 싶어요', 'COMPLETED', '2026-10-20 18:00:00', '2026-10-25 13:10:00'),
  (3, 5, '셔츠 받고 싶어요', 'ACCEPTED', '2026-11-01 08:40:00', NULL),
  (3, 6, '저도 필요해요!', 'PENDING', '2026-11-02 12:00:00', NULL),
  (5, 6, '사이즈 딱 맞아요', 'PENDING', '2026-11-03 13:00:00', NULL),
  (4, 3, '바지 아직 있나요?', 'PENDING', '2026-11-04 15:20:00', NULL);
