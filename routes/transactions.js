const express = require('express');
const pool = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

// helper
async function getByType(userId, type) {
  const result = await pool.query(
    `SELECT id, category, description, amount, date
     FROM transactions
     WHERE user_id = $1 AND type = $2
     ORDER BY date DESC, id DESC`,
    [userId, type]
  );
  return result.rows;
}

// pemasukan
router.get('/income', auth, async (req, res) => {
  try {
    const data = await getByType(req.user.id, 'INCOME');
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/income', auth, async (req, res) => {
  const { category, description, amount, date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, category, description, amount, date)
       VALUES ($1, 'INCOME', $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, category, description, amount, date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// pengeluaran
router.get('/expense', auth, async (req, res) => {
  try {
    const data = await getByType(req.user.id, 'EXPENSE');
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/expense', auth, async (req, res) => {
  const { category, description, amount, date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, type, category, description, amount, date)
       VALUES ($1, 'EXPENSE', $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, category, description, amount, date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// hapus transaksi
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// transaksi terbaru
router.get('/recent', auth, async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  try {
    const result = await pool.query(
      `SELECT id, type, category, description, amount, date
       FROM transactions
       WHERE user_id = $1
       ORDER BY date DESC, id DESC
       LIMIT $2`,
      [req.user.id, limit]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
