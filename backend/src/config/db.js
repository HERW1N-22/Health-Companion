const { Pool } = require('pg');
const mongoose = require('mongoose');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

async function connectPostgres() {
  await pool.connect();
}

async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost:27017/health_companion');
}

module.exports = { pool, connectPostgres, connectMongo };
