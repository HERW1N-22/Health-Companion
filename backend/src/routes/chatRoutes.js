const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/db');
const { verifyToken } = require('../utils/auth');
const ChatLog = require('../models/ChatLog');

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

router.post('/', [body('message').isString().notEmpty()], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { message } = req.body;
    const recentEntries = await pool.query('SELECT * FROM health_entries WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5', [req.user.id]);
    const recentVitals = await pool.query('SELECT * FROM vitals WHERE user_id = $1 ORDER BY recorded_at DESC LIMIT 5', [req.user.id]);

    const context = `User context: recent health entries=${JSON.stringify(recentEntries.rows)}; recent vitals=${JSON.stringify(recentVitals.rows)}.`;
    const systemPrompt = 'You are an AI health companion. Never diagnose. Always encourage consulting a doctor for serious symptoms. Use the provided context to personalize responses and stay supportive.';

    let assistantReply = `${systemPrompt}\n\n${context}\n\nUser: ${message}\nAssistant: I can help with general wellness guidance, but I am not a doctor. For serious symptoms, please consult a doctor.`;

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 220,
            system: systemPrompt,
            messages: [{ role: 'user', content: `${context}\n\nUser: ${message}` }]
          })
        });
        const payload = await response.json();
        assistantReply = payload?.content?.[0]?.text || assistantReply;
      } catch (error) {
        console.error('Anthropic request failed', error);
      }
    }

    await pool.query('INSERT INTO chat_logs (user_id, role, content) VALUES ($1, $2, $3)', [req.user.id, 'user', message]);
    await pool.query('INSERT INTO chat_logs (user_id, role, content) VALUES ($1, $2, $3)', [req.user.id, 'assistant', assistantReply]);
    await ChatLog.create({ userId: req.user.id, role: 'user', content: message });
    await ChatLog.create({ userId: req.user.id, role: 'assistant', content: assistantReply });

    res.json({ reply: assistantReply });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
