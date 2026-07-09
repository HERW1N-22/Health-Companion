const express = require('express');
const { pool } = require('../config/db');
const { verifyToken } = require('../utils/auth');

const router = express.Router();

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Missing token' });
  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}

router.use(authMiddleware);

router.get('/summary', async (req, res, next) => {
  try {
    const entries = await pool.query('SELECT * FROM health_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10', [req.user.id]);
    const vitals = await pool.query('SELECT * FROM vitals WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 10', [req.user.id]);
    res.json({ entries: entries.rows, vitals: vitals.rows });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
