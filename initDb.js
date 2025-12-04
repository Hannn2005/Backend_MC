const pool = require('./db');

async function initDb() {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME','EXPENSE')),
      category VARCHAR(50) NOT NULL,
      description TEXT,
      amount NUMERIC(14,2) NOT NULL,
      date DATE NOT NULL DEFAULT CURRENT_DATE
    );
  `;

  await pool.query(sql);
  console.log('database terhubung');
}

module.exports = initDb;
