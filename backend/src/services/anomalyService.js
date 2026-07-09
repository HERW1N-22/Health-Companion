const { pool } = require('../config/db');

async function detectAnomalies(userId, metricType) {
  const result = await pool.query('SELECT value FROM vitals WHERE user_id = $1 AND metric_type = $2 ORDER BY recorded_at DESC LIMIT 10', [userId, metricType]);
  const values = result.rows.map((row) => Number(row.value));
  if (values.length < 2) return [];

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  const std = Math.sqrt(variance);

  const thresholds = {
    bp: { min: 80, max: 180 },
    sugar: { min: 70, max: 180 },
    heart_rate: { min: 50, max: 110 },
    weight: { min: 40, max: 220 }
  };

  const rule = thresholds[metricType] || {};
  const anomalies = [];
  const latest = values[0];

  if (rule.min != null && latest < rule.min) anomalies.push({ type: 'low', message: `Value is lower than expected for ${metricType}.` });
  if (rule.max != null && latest > rule.max) anomalies.push({ type: 'high', message: `Value is higher than expected for ${metricType}.` });
  if (std > 0 && Math.abs(latest - mean) > 2 * std) anomalies.push({ type: 'zscore', message: 'Recent value deviates strongly from your recent pattern.' });

  return anomalies;
}

module.exports = { detectAnomalies };
