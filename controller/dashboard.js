const pool = require('../db')

exports.getDashboardSummary = async (req, res) => {
  const userId = req.user.id

  try {
    const totalIncome = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total
       FROM transactions
       WHERE user_id = $1 AND type = 'INCOME'`,
      [userId]
    )

    const totalExpense = await pool.query(
      `SELECT COALESCE(SUM(amount),0) AS total
       FROM transactions
       WHERE user_id = $1 AND type = 'EXPENSE'`,
      [userId]
    )

    const byCategory = await pool.query(
      `SELECT category, COALESCE(SUM(amount),0) AS total
       FROM transactions
       WHERE user_id = $1 AND type = 'EXPENSE'
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    )

    const monthly = await pool.query(
      `SELECT
          to_char(date_trunc('month', date), 'YYYY-MM') AS month,
          SUM(CASE WHEN type='INCOME' THEN amount ELSE 0 END) AS income,
          SUM(CASE WHEN type='EXPENSE' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE user_id = $1
       GROUP BY date_trunc('month', date)
       ORDER BY month`,
      [userId]
    )

    res.json({
      totalIncome: Number(totalIncome.rows[0].total),
      totalExpense: Number(totalExpense.rows[0].total),
      balance:
        Number(totalIncome.rows[0].total) -
        Number(totalExpense.rows[0].total),
      byCategory: byCategory.rows,
      monthly: monthly.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}
