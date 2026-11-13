import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const makeToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, nickname: user.nickname },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

router.post('/signup', async (req, res) => {
  const { email, password, nickname, phone_number, entry_year, student_id } = req.body;

  if (!email || !password || !nickname || !phone_number || !entry_year || !student_id) {
    return res.status(400).json({ message: '모든 필수 정보를 입력해 주세요.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users (email, password, nickname, phone_number, entry_year, student_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, nickname, phone_number, entry_year, student_id]
    );

    const user = { id: result.insertId, email, nickname };
    return res.status(201).json({ message: '회원가입이 완료되었습니다.', token: makeToken(user), user });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 등록된 회원 정보(이메일/전화번호/학번)입니다.' });
    }
    console.error('회원가입 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해 주세요.' });
  }

  try {
    const [rows] = await db.query('SELECT id, email, password, nickname FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '등록된 회원 정보가 없습니다.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    const safeUser = { id: user.id, email: user.email, nickname: user.nickname };
    return res.status(200).json({ message: '로그인 성공', token: makeToken(safeUser), user: safeUser });
  } catch (error) {
    console.error('로그인 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.nickname, u.phone_number, u.entry_year, u.student_id, u.created_at,
              (SELECT COUNT(*) FROM posts WHERE seller_id = u.id) AS posted_count,
              (SELECT COUNT(*) FROM posts WHERE seller_id = u.id AND status = 'COMPLETED') AS given_count,
              (SELECT COUNT(*) FROM trades WHERE requester_id = u.id AND status = 'COMPLETED') AS received_count
       FROM users u WHERE u.id = ?`,
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.put('/me', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword, nickname, phone_number, entry_year, student_id } = req.body;

  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(currentPassword || '', rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    await db.query(
      'UPDATE users SET nickname = ?, phone_number = ?, entry_year = ?, student_id = ? WHERE id = ?',
      [nickname, phone_number, entry_year, student_id, req.user.id]
    );

    if (newPassword) {
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    }

    return res.json({ message: '프로필 정보가 수정되었습니다.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: '이미 사용 중인 전화번호 또는 학번입니다.' });
    }
    console.error('프로필 수정 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.delete('/me', authenticateToken, async (req, res) => {
  const { password } = req.body;
  const conn = await db.getConnection();

  try {
    const [rows] = await conn.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    const isMatch = await bcrypt.compare(password || '', rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: '비밀번호가 일치하지 않습니다.' });
    }

    await conn.beginTransaction();
    await conn.query(`DELETE FROM posts WHERE seller_id = ? AND status <> 'COMPLETED'`, [req.user.id]);
    await conn.query(`DELETE FROM trades WHERE requester_id = ? AND status <> 'COMPLETED'`, [req.user.id]);
    await conn.query('DELETE FROM users WHERE id = ?', [req.user.id]);
    await conn.commit();

    return res.json({ message: '회원 탈퇴가 완료되었습니다.' });
  } catch (error) {
    await conn.rollback();
    console.error('회원 탈퇴 에러:', error);
    return res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  } finally {
    conn.release();
  }
});

export default router;
