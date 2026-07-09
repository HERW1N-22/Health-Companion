const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const { encryptText } = require('../utils/encryption');

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

router.post('/entries', [
  body('type').isIn(['sleep', 'water', 'meal', 'mood', 'exercise', 'medication']),
  body('value').exists()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, value, note } = req.body;
    const result = await pool.query(
      'INSERT INTO health_entries (user_id, entry_type, value, note) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, type, encryptText(String(value)), encryptText(note || '')]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

router.get('/entries', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM health_entries WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
