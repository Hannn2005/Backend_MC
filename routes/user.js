const express = require('express')
const auth = require('../middleware/auth')
const authController = require('../controller/user.js')

const router = express.Router()

router.post('/register', authController.register)
router.post('/login', authController.login)

router.get('/me', auth, authController.getMe)
router.delete('/me', auth, authController.deleteMe)

module.exports = router
