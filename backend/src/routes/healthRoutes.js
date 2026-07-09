const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const { encryptText, decryptText } = require('../utils/encryption');

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

router.get('/export', async (req, res, next) => {
  try {
    const entries = await pool.query('SELECT * FROM health_entries WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    const vitals = await pool.query('SELECT * FROM vitals WHERE user_id = $1 ORDER BY recorded_at DESC', [req.user.id]);
    const mappedEntries = entries.rows.map((entry) => ({ ...entry, value: decryptText(entry.value), note: decryptText(entry.note) }));
    const mappedVitals = vitals.rows.map((entry) => ({ ...entry, value: decryptText(entry.value), note: decryptText(entry.note) }));
    res.json({ entries: mappedEntries, vitals: mappedVitals });
  } catch (error) {
    next(error);
  }
});

router.post('/reminders', [body('message').isString().notEmpty()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    res.json({ reminder: { message: req.body.message, scheduled: true } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
