const express = require('express')
const auth = require('../middleware/auth')
const dashboardController = require('../controller/dashboard.js')

const router = express.Router()

router.get('/summary',auth,dashboardController.getDashboardSummary)

module.exports = router
