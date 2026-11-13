import express from 'express';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  const { post_id, message } = req.body;
  try {
    const [posts] = await db.query('SELECT seller_id, status FROM posts WHERE id = ?', [post_id]);
    if (posts.length === 0) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });
    if (posts[0].seller_id === req.user.id) return res.status(400).json({ message: '내 글에는 요청할 수 없습니다.' });
    if (posts[0].status === 'COMPLETED') return res.status(400).json({ message: '이미 물려준 옷입니다.' });

    const [dup] = await db.query(
      `SELECT id FROM trades WHERE post_id = ? AND requester_id = ? AND status IN ('PENDING', 'ACCEPTED')`,
      [post_id, req.user.id]
    );
    if (dup.length > 0) return res.status(409).json({ message: '이미 요청한 옷입니다.' });

    await db.query('INSERT INTO trades (post_id, requester_id, message) VALUES (?, ?, ?)', [post_id, req.user.id, message || null]);
    res.status(201).json({ message: '요청을 보냈어요.' });
  } catch (error) {
    console.error('거래 요청 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.patch('/:id', authenticateToken, async (req, res) => {
  const { action } = req.body;
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT t.id, t.post_id, t.requester_id, t.status, p.seller_id
       FROM trades t JOIN posts p ON p.id = t.post_id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: '요청을 찾을 수 없습니다.' });
    const t = rows[0];
    const isSeller = t.seller_id === req.user.id;
    const isRequester = t.requester_id === req.user.id;

    await conn.beginTransaction();

    if (action === 'accept' && isSeller && t.status === 'PENDING') {
      await conn.query(`UPDATE trades SET status = 'ACCEPTED' WHERE id = ?`, [t.id]);
      await conn.query(`UPDATE posts SET status = 'RESERVED' WHERE id = ?`, [t.post_id]);
    } else if (action === 'reject' && isSeller && ['PENDING', 'ACCEPTED'].includes(t.status)) {
      await conn.query(`UPDATE trades SET status = 'REJECTED' WHERE id = ?`, [t.id]);
      if (t.status === 'ACCEPTED') await conn.query(`UPDATE posts SET status = 'SELLING' WHERE id = ?`, [t.post_id]);
    } else if (action === 'complete' && isSeller && t.status === 'ACCEPTED') {
      await conn.query(`UPDATE trades SET status = 'COMPLETED', completed_at = NOW() WHERE id = ?`, [t.id]);
      await conn.query(`UPDATE posts SET status = 'COMPLETED' WHERE id = ?`, [t.post_id]);
      await conn.query(`UPDATE trades SET status = 'REJECTED' WHERE post_id = ? AND status = 'PENDING'`, [t.post_id]);
    } else if (action === 'cancel' && isRequester && ['PENDING', 'ACCEPTED'].includes(t.status)) {
      await conn.query('DELETE FROM trades WHERE id = ?', [t.id]);
      if (t.status === 'ACCEPTED') await conn.query(`UPDATE posts SET status = 'SELLING' WHERE id = ?`, [t.post_id]);
    } else {
      await conn.rollback();
      return res.status(400).json({ message: '할 수 없는 요청입니다.' });
    }

    await conn.commit();
    res.json({ message: '처리되었습니다.' });
  } catch (error) {
    await conn.rollback();
    console.error('거래 처리 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  } finally {
    conn.release();
  }
});

export default router;
