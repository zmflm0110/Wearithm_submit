# Wearithm

교내 교복·의류 물려주기 마켓

## CRUD

### 회원 (users)

| | 기능 | 화면 | API | SQL |
|---|---|---|---|---|
| C | 회원가입 | `/signup` | `POST /api/users/signup` | `INSERT INTO users` |
| R | 로그인 / 내 정보 | `/login`, `/mypage` | `POST /api/users/login`, `GET /api/users/me` | `SELECT ... FROM users WHERE ...` |
| U | 내 정보 수정 | `/mypage/edit` | `PUT /api/users/me` | `UPDATE users SET ...` |
| D | 회원 탈퇴 | `/mypage/edit` | `DELETE /api/users/me` | `DELETE FROM users` |

### 옷 글 (posts)

| | 기능 | 화면 | API | SQL |
|---|---|---|---|---|
| C | 옷 올리기 | `/write` | `POST /api/posts` | `INSERT INTO posts` |
| R | 목록 · 검색 · 상세 | `/`, `/items/:id` | `GET /api/posts`, `GET /api/posts/:id` | `SELECT ... FROM posts` |
| U | 수정 | `/items/:id/edit` | `PUT /api/posts/:id` | `UPDATE posts ... WHERE id = ? AND seller_id = ?` |
| D | 삭제 | `/items/:id` | `DELETE /api/posts/:id` | `DELETE FROM posts WHERE id = ? AND seller_id = ?` |

## JOIN

### 1. 순환 기록 (`/history`)

trades + posts + users(보낸 사람) + users(받은 사람)

```sql
SELECT p.title, s.nickname AS giver, r.nickname AS receiver, t.completed_at
FROM trades t
JOIN posts p      ON p.id = t.post_id
LEFT JOIN users s ON s.id = p.seller_id
LEFT JOIN users r ON r.id = t.requester_id
WHERE t.status = 'COMPLETED';
```

- trades 의 post_id 로 어떤 옷인지 posts 에서 찾는다.
- posts 의 seller_id 로 보낸 사람, trades 의 requester_id 로 받은 사람을 users 에서 찾는다.
- users 를 s, r 두 번 JOIN 해서 "보낸 사람 → 받은 사람"을 한 줄로 보여준다.

### 2. 옷 목록 · 상세 (`/`, `/items/:id`)

posts + users

```sql
SELECT p.*, u.nickname AS seller_nickname
FROM posts p
LEFT JOIN users u ON u.id = p.seller_id;
```

- posts 의 seller_id 로 users 에서 올린 사람 닉네임을 가져온다.
- LEFT JOIN 이라 올린 사람이 탈퇴해도 글은 목록에 남는다.
