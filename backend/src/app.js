const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/health', require('./routes/trackerRoutes'));
app.use('/api/vitals', require('./routes/vitalsRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/health-export', require('./routes/healthRoutes'));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
