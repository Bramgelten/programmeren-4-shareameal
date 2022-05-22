const express = require('express')
const userController = require('../controllers/user.controller')
const athenticationController = require('../controllers/authentication.controller')
const router = express.Router()

router.all("/api/user/profile", athenticationController.validateToken, userController.getUserProfile);
router.post('/user', userController.validateUser, userController.createUser)
router.get('/user', userController.getAll)
router.get("/api/user?firstName&isActive", userController.getAll);
router.get('/user/:userId', athenticationController.validateToken, userController.getUserById)
router.put('/user/:userId', athenticationController.validateToken, userController.validateUpdateUser, userController.validateUser, userController.updateUser)
router.delete('/user/:userId', athenticationController.validateToken, userController.deleteUser)

module.exports = router
