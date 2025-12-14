const express = require('express')
const auth = require('../middleware/auth')
const controller = require('../controller/transaction.js')

const router = express.Router()

router.get('/income', auth, controller.getIncome)
router.post('/income', auth, controller.addIncome)

router.get('/expense', auth, controller.getExpense)
router.post('/expense', auth, controller.addExpense)

router.get('/recent', auth, controller.getRecent)
router.get('/summary', auth, controller.getSummary)

router.put('/:id', auth, controller.updateTransaction)
router.delete('/:id', auth, controller.deleteTransaction)

module.exports = router
