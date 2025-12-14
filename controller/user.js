const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const pool = require('../db')

// ================= REGISTER =================
exports.register = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Lengkapi semua field' })
  }

  try {
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' })
    }

    const hash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hash]
    )

    const user = result.rows[0]

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { email, password } = req.body

  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Email atau password salah' })
    }

    const user = result.rows[0]
    const match = await bcrypt.compare(password, user.password_hash)

    if (!match) {
      return res.status(400).json({ message: 'Email atau password salah' })
    }

    delete user.password_hash

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ user, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= GET CURRENT USER =================
exports.getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    )

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= DELETE ACCOUNT =================
exports.deleteMe = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM users WHERE id = $1',
      [req.user.id]
    )

    res.json({ message: 'Account berhasil dihapus' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
