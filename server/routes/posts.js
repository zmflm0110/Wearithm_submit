import express from 'express';
import multer from 'multer';
import path from 'path';
import db from '../db.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const POST_SELECT = `
  SELECT p.*, u.nickname AS seller_nickname, u.student_id AS seller_student_id
  FROM posts p
  LEFT JOIN users u ON u.id = p.seller_id`;

router.get('/', async (req, res) => {
  const { category, q } = req.query;
  let sql = `${POST_SELECT} WHERE 1 = 1`;
  const params = [];
  if (category && category !== '전체') { sql += ' AND p.category = ?'; params.push(category); }
  if (q) { sql += ' AND p.title LIKE ?'; params.push(`%${q}%`); }
  sql += ' ORDER BY p.id DESC';

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('목록 조회 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const [[{ completed }]] = await db.query(`SELECT COUNT(*) AS completed FROM posts WHERE status = 'COMPLETED'`);
    const [byCategory] = await db.query(`SELECT category, COUNT(*) AS cnt FROM posts GROUP BY category ORDER BY cnt DESC`);
    res.json({ completed, byCategory });
  } catch (error) {
    console.error('통계 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.title, p.category, p.image_url,
              IFNULL(s.nickname, '탈퇴한 사용자') AS giver,
              IFNULL(r.nickname, '탈퇴한 사용자') AS receiver,
              t.completed_at
       FROM trades t
       JOIN posts p      ON p.id = t.post_id
       LEFT JOIN users s ON s.id = p.seller_id
       LEFT JOIN users r ON r.id = t.requester_id
       WHERE t.status = 'COMPLETED'
       ORDER BY t.completed_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('순환 기록 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.get('/mine', authenticateToken, async (req, res) => {
  const [rows] = await db.query(`${POST_SELECT} WHERE p.seller_id = ? ORDER BY p.id DESC`, [req.user.id]);
  res.json(rows);
});

router.get('/received', authenticateToken, async (req, res) => {
  const [rows] = await db.query(
    `${POST_SELECT}
     JOIN trades t ON t.post_id = p.id
     WHERE t.requester_id = ? AND t.status = 'COMPLETED'
     ORDER BY t.completed_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`${POST_SELECT} WHERE p.id = ?`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: '글을 찾을 수 없습니다.' });

    const [trades] = await db.query(
      `SELECT t.id, t.requester_id, t.message, t.status, t.created_at, t.completed_at,
              IFNULL(u.nickname, '탈퇴한 사용자') AS requester_nickname
       FROM trades t
       LEFT JOIN users u ON u.id = t.requester_id
       WHERE t.post_id = ?
       ORDER BY t.id`,
      [req.params.id]
    );
    res.json({ ...rows[0], trades });
  } catch (error) {
    console.error('상세 조회 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

const readForm = (body) => {
  const tradeType = body.trade_type === 'SELL' ? 'SELL' : 'FREE';
  return {
    title: body.title,
    description: body.description,
    category: body.category,
    size: body.size,
    fabric: body.fabric || null,
    texture: body.texture || null,
    item_condition: body.item_condition || 'B',
    trade_type: tradeType,
    price: tradeType === 'FREE' ? 0 : Number(body.price) || 0,
    location: body.location,
  };
};

router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  const f = readForm(req.body);
  if (!f.title || !f.description || !f.category || !f.size || !f.location) {
    return res.status(400).json({ message: '필수 정보를 모두 입력해 주세요.' });
  }
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const [result] = await db.query(
      `INSERT INTO posts (seller_id, title, description, category, size, fabric, texture,
                          item_condition, trade_type, price, location, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, f.title, f.description, f.category, f.size, f.fabric, f.texture,
       f.item_condition, f.trade_type, f.price, f.location, imageUrl]
    );
    res.status(201).json({ message: '등록되었습니다.', id: result.insertId });
  } catch (error) {
    console.error('등록 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

const checkOwner = async (postId, userId) => {
  const [rows] = await db.query('SELECT seller_id, status FROM posts WHERE id = ?', [postId]);
  if (rows.length === 0) return [404, '글을 찾을 수 없습니다.'];
  if (rows[0].seller_id !== userId) return [403, '본인이 올린 글만 수정·삭제할 수 있습니다.'];
  if (rows[0].status === 'COMPLETED') return [400, '이미 물려준 옷은 수정·삭제할 수 없습니다.'];
  return null;
};

router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const err = await checkOwner(req.params.id, req.user.id);
  if (err) return res.status(err[0]).json({ message: err[1] });

  const f = readForm(req.body);
  try {
    await db.query(
      `UPDATE posts SET title = ?, description = ?, category = ?, size = ?, fabric = ?, texture = ?,
                        item_condition = ?, trade_type = ?, price = ?, location = ?
       WHERE id = ? AND seller_id = ?`,
      [f.title, f.description, f.category, f.size, f.fabric, f.texture,
       f.item_condition, f.trade_type, f.price, f.location, req.params.id, req.user.id]
    );
    if (req.file) {
      await db.query('UPDATE posts SET image_url = ? WHERE id = ?', [`/uploads/${req.file.filename}`, req.params.id]);
    }
    res.json({ message: '수정되었습니다.', id: Number(req.params.id) });
  } catch (error) {
    console.error('수정 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const err = await checkOwner(req.params.id, req.user.id);
  if (err) return res.status(err[0]).json({ message: err[1] });

  try {
    await db.query('DELETE FROM posts WHERE id = ? AND seller_id = ?', [req.params.id, req.user.id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (error) {
    console.error('삭제 에러:', error);
    res.status(500).json({ message: '서버 에러가 발생했습니다.' });
  }
});

export default router;
