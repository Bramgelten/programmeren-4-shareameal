const express = require('express')
const mealController = require('../controllers/meal.controller')
const athenticationController = require('../controllers/authentication.controller')
const router = express.Router()


router.post('/api/meal',athenticationController.validateToken, mealController.addMeal)
router.get('/api/meal/:mealId', mealController.getMealById)
router.delete('/api/meal/:mealId',athenticationController.validateToken, athenticationController.validateOwnership, mealController.deleteMeal)
router.put('/api/meal/:mealId', athenticationController.validateToken, athenticationController.validateOwnership, mealController.updateMeal)
router.get('/api/meal/', mealController.getAllMeals)
