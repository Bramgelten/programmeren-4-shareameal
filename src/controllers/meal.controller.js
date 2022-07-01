const { equal } = require('assert')
const assert = require('assert')
const { isBuffer } = require('util')
const dbconnection = require('../../database/dbconnection')
const pool = require('../../dbconnection')
const logger = require('../config/config').logger

let mealController = {
    //UC-301
    addMeal: (req, res) => {
        let meal = req.body
        const cookId = req.userId
        let price = parseFloat(meal.price)
        console.log(price)
        let allergenes = req.body.allergenes.join()

        sqlAddMeal = `INSERT INTO meal (dateTime, maxAmountOfParticipants, price, imageUrl, cookId, name, description, isActive, isVega, isVegan, isToTakeHome, allergenes) VALUES(STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`
        sqlGetAddedMeal = 'SELECT * FROM meal ORDER BY createDate DESC LIMIT 1;'
        pool.query(
            sqlAddMeal,
            [
                meal.dateTime,
                meal.maxAmountOfParticipants,
                meal.price,
                meal.imageUrl,
                cookId,
                meal.name,
                meal.description,
                meal.isActive,
                meal.isVega,
                meal.isVegan,
                meal.isToTakeHome,
                allergenes,
            ],
            function (error, result, fields) {
                if (error) {
                    console.log(error)
                    res.status(409).json({
                        status: 409,
                        message: `Could not add meal`,
                    })
                } else {
                    res.status(201).json({
                        status: 201,
                        result: {
                            id: result.insertId,
                            cookId: cookId,
                            ...meal,
                        },
                    })
                }
            }
        )
    },
    //UC-302
    getAll: (req, res, next) => {
        console.log('getAll aangeroepen')
        let sqlGetall = 'SELECT * FROM meal;'

        pool.query(sqlGetall, function (error, results) {
            if (error) {
                next(error)
            }

            res.status(200).json({
                status: 200,
                result: results,
            })
        })
    },

    //UC-303 Get single meal by Id
    getMealById: (req, res) => {
        const mealId = req.params.mealId
        logger.debug(`Meal with ID ${mealId} requested`)

        sqlGetByID = 'SELECT * FROM meal WHERE id = ?;'

        pool.query(sqlGetByID, [mealId], function (error, results) {
            if (error) throw error
            else if (results.length > 0) {
                let meal = results[0]
                results[0].isActive = meal.isActive ? true : false
                results[0].isVega = meal.isVega ? true : false
                results[0].isVegan = meal.isVegan ? true : false
                results[0].isToTakeHome = meal.isToTakeHome ? true : false

                res.status(200).json({
                    status: 200,
                    result: results[0],
                })
            } else {
                res.status(404).json({
                    status: 404,
                    message: `Meal with ID ${mealId} could not be found`,
                })
            }
        })
    },

    //UC-304 Update a single meal
    updateMeal: (req, res) => {
        const mealId = req.params.mealId
        const updateMeal = req.body
        let price = parseFloat(updateMeal.price)
        let updateAllergenes = req.body.allergenes.join()
        logger.debug(`Meal with ID ${mealId} requested to be updated`)

        let sqlUpdateMeal = `UPDATE meal SET name = ?, description = ?, isActive = ?, isVega = ?, isVegan = ?, isToTakeHome = ?, dateTime = STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s.%fZ'), imageUrl = ?, allergenes = ?, maxAmountOfParticipants = ?, price = ? WHERE id = ?;`
        let sqlGetUpdatedMeal = 'SELECT * FROM meal WHERE id = ?;'
        pool.query(
            sqlUpdateMeal,
            [
                updateMeal.name,
                updateMeal.description,
                updateMeal.isActive,
                updateMeal.isVega,
                updateMeal.isVegan,
                updateMeal.isToTakeHome,
                updateMeal.dateTime,
                updateMeal.imageUrl,
                updateAllergenes,
                updateMeal.maxAmountOfParticipants,
                price,
                mealId,
            ],
            function (error, results, fields) {
                if (error) throw error
                else if (results.affectedRows > 0) {
                    pool.query(
                        sqlGetUpdatedMeal,
                        [mealId],
                        function (error, results, fields) {
                            results[0].price = price

                            let meal = results[0]
                            results[0].isActive = meal.isActive ? true : false
                            results[0].isVega = meal.isVega ? true : false
                            results[0].isVegan = meal.isVegan ? true : false
                            results[0].isToTakeHome = meal.isToTakeHome
                                ? true
                                : false

                            res.status(200).json({
                                status: 200,
                                result: results[0],
                            })
                        }
                    )
                }
            }
        )
    },
    //UC-305 Delete meal
    deleteMeal: (req, res) => {
        const mealId = req.params.mealId
        logger.debug(`Meal with ID ${mealId} requested to be deleted`)

        sqlDeleteMeal = 'DELETE FROM meal WHERE id = ?;'

        pool.query(sqlDeleteMeal, [mealId], function (error, results, fields) {
            if (error) throw error
            if (results.affectedRows > 0) {
                res.status(200).json({
                    status: 200,
                    message: `Meal with ID ${mealId} succesfully deleted`,
                })
            } else {
                res.status(404).json({
                    status: 404,
                    message: `Deleting meal not possible, meal with ID ${mealId} does not exist`,
                })
            }
        })
    },

    validateMeal: (req, res, next) => {
        let meal = req.body
        let {
            dateTime,
            price,
            imageUrl,
            name,
            description,
            isToTakeHome,
            isVega,
            isVegan,
            isActive,
        } = meal
        try {
            assert(typeof imageUrl === 'string', 'ImageUrl must be a string')
            assert(typeof name === 'string', 'Name must be a string')
            assert(
                typeof description === 'string',
                'Description must be a string'
            )
            assert(typeof price === 'number', 'Price must be a number')
            assert(typeof dateTime === 'string', 'DateTime must be a string')
            assert(isToTakeHome != null, 'isToTakeHome cannot be null')
            assert(isVega != null, 'isVega cannot be null')
            assert(isVegan != null, 'isVegan cannot be null')
            assert(isActive != null, 'isActive cannot be null')
            next()
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            }
            next(error)
        }
    },
    validateUpdateMeal: (req, res, next) => {
        let meal = req.body
        let { maxAmountOfParticipants } = meal
        try {
            assert(
                typeof maxAmountOfParticipants === 'number',
                'Maximum amount of participants must be present'
            )
            next()
        } catch (err) {
            const error = {
                status: 400,
                message: err.message,
            }
            next(error)
        }
    },
}

module.exports = mealController
