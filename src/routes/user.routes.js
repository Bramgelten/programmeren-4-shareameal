const express = require('express')
const userController = require('../controllers/user.controller')
const router = express.Router()

router.post('/user', userController.validateUser, userController.createUser)
router.get('/user', userController.getAll)
router.get('/user/:userId', userController.getById)

module.exports = router
