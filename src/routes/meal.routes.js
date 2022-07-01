const express = require('express')
const router = express.Router()
const mealController = require('../controllers/meal.controller')
const authController = require('../controllers/auth.controller')
const logger = require('../config/config').logger

//handling a post request for a new meal
router.post(
    '/meal',
    authController.validateToken,
    mealController.validateMeal,
    mealController.addMeal
)

//getting a meal by id
router.get('/meal/:mealId', mealController.getMealById)

//deleting a meal by id
router.delete(
    '/meal/:mealId',
    authController.validateToken,
    authController.validateOwnership,
    mealController.deleteMeal
)

//updating a meal by id
router.put(
    '/meal/:mealId',
    authController.validateToken,
    authController.validateOwnership,
    mealController.validateMeal,
    mealController.validateUpdateMeal,
    mealController.updateMeal
)

//getting all meals
router.get('/meal/', mealController.getAll)

//one request for adding or removing a user participation from a meal
//the first requests adds the participation, the second request for that user and meal will remove the existing one
// router.get(
//     '/api/meal/:mealId/participate',
//     authController.validateToken,
//     mealController.manageParticipation
// )

module.exports = router
