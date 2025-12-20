const pool = require('../db')

// ================= Helper =================
async function getByType(userId, type, startDate, endDate) {
  let query = `
    SELECT id, category, description, amount, date
    FROM transactions
    WHERE user_id = $1 AND type = $2
  `
  const params = [userId, type]

  if (startDate && endDate) {
    query += ` AND date BETWEEN $3 AND $4`
    params.push(startDate, endDate)
  }

  query += ` ORDER BY date DESC, id DESC`

  const result = await pool.query(query, params)
  return result.rows
}

// ================= helper untuk logika pengeluaran !> pendapatan =================

async function getCurrentBalance(userId) {
  const result = await pool.query(
    `
    SELECT type, COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE user_id = $1
    GROUP BY type
    `,
    [userId]
  )

  let income = 0
  let expense = 0

  result.rows.forEach((row) => {
    if (row.type === 'INCOME') income = Number(row.total)
    if (row.type === 'EXPENSE') expense = Number(row.total)
  })

  return income - expense
}

// =================  =================
exports.getIncome = async (req, res) => {
  const { startDate, endDate } = req.query

  try {
    const data = await getByType(
      req.user.id,
      'INCOME',
      startDate,
      endDate
    )
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= ADD INCOME =================
exports.addIncome = async (req, res) => {
  const { category, description, amount, date } = req.body

  if (!category?.trim() || !description?.trim() || !amount || !date) {
    return res.status(400).json({ message: 'Semua data harus diisi' })
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO transactions (user_id, type, category, description, amount, date)
      VALUES ($1, 'INCOME', $2, $3, $4, $5)
      RETURNING *
      `,
      [req.user.id, category, description, amount, date]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= GET EXPENSE =================
exports.getExpense = async (req, res) => {
  const { startDate, endDate } = req.query

  try {
    const data = await getByType(
      req.user.id,
      'EXPENSE',
      startDate,
      endDate
    )
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= ADD EXPENSE =================
exports.addExpense = async (req, res) => {
  const { category, description, amount, date } = req.body

  if (!category?.trim() || !description?.trim() || !amount || !date) {
    return res.status(400).json({ message: 'Semua data harus diisi' })
  }

  try {
    const balance = await getCurrentBalance(req.user.id)

    if (Number(amount) > balance) {
      return res.status(400).json({
        message: 'Pengeluaran melebihi pendapatan saat ini',
        balance
      })
    }

    const result = await pool.query(
      `
      INSERT INTO transactions (user_id, type, category, description, amount, date)
      VALUES ($1, 'EXPENSE', $2, $3, $4, $5)
      RETURNING *
      `,
      [req.user.id, category, description, amount, date]
    )

    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}


// ================= DELETE =================
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params

  try {
    await pool.query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    )
    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= UPDATE =================
exports.updateTransaction = async (req, res) => {
  const { id } = req.params
  const { category, description, amount, date } = req.body

  try {
    const result = await pool.query(
      `
      UPDATE transactions
      SET category = $1,
          description = $2,
          amount = $3,
          date = $4
      WHERE id = $5 AND user_id = $6
      RETURNING *
      `,
      [category, description, amount, date, id, req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Data tidak ditemukan' })
    }

    res.json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= RECENT =================
exports.getRecent = async (req, res) => {
  const limit = Number(req.query.limit) || 5

  try {
    const result = await pool.query(
      `
      SELECT id, type, category, description, amount, date
      FROM transactions
      WHERE user_id = $1
      ORDER BY date DESC, id DESC
      LIMIT $2
      `,
      [req.user.id, limit]
    )

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

// ================= SUMMARY =================
exports.getSummary = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT type, COALESCE(SUM(amount), 0) AS total
      FROM transactions
      WHERE user_id = $1
      GROUP BY type
      `,
      [req.user.id]
    )

    let income = 0
    let expense = 0

    result.rows.forEach((row) => {
      if (row.type === 'INCOME') income = Number(row.total)
      if (row.type === 'EXPENSE') expense = Number(row.total)
    })

    res.json({ income, expense })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
