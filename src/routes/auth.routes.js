const express = require('express')
const authController = require('../controllers/auth.controller')
const router = express.Router()

router.post('/auth/login', authController.validateLogin, authController.login)

module.exports = router
