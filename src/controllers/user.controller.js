const database = require('../../database/inmemdb')
const dbconnection = require('../../database/dbconnection')
const assert = require('assert')
const pool = require('../../dbconnection')
const bcrypt = require('bcrypt')
const saltRounds = 10

const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

let userController = {
    //UC-201
    createUser: (req, res) => {
        const user = req.body
        emailadres = req.body.emailAdress
        wachtwoord = req.body.password

        voornaam = req.body.firstName
        achternaam = req.body.lastName
        straat = req.body.street
        plaats = req.body.city
        nummer = req.body.phoneNumber

        bcrypt.hash(wachtwoord, saltRounds, function (err, hash) {
            let sqlRegister =
                'INSERT INTO user (firstName, lastName, street, city, phoneNumber, emailAdress, password) VALUES ?;'
            let valuesRegister = [
                [
                    voornaam,
                    achternaam,
                    straat,
                    plaats,
                    nummer,
                    emailadres,
                    hash,
                ],
            ]

            pool.query(sqlRegister, [valuesRegister], (dbError, result) => {
                if (dbError) {
                    logger.debug(dbError.message)
                    const error = {
                        status: 409,
                        message: 'User has not been added to database',
                        result: 'User is niet toegevoegd in database',
                    }
                    next(error)
                    return
                } else {
                    res.status(201).json({
                        status: 201,
                        message: 'User has been added to the database',
                        result: { id: result.inserId, ...user },
                    })
                }
            })
        })
    },
    //UC-203
    getUserProfile: (req, res, next) => {
        const userId = req.userId
        logger.debug(`Personal profile of user with ID ${userId} requested`)

        sqlGetProfile = 'SELECT * FROM user WHERE id = ?;'

        pool.query(sqlGetProfile, userId, function (error, results) {
            if (error) throw error
            else {
                res.status(200).json({
                    status: 200,
                    result: results[0],
                })
            }
        })

        // dbconnection.getConnection(function (err, connection) {
        //     if (err) throw err
        //     connection.query(
        //         'SELECT * FROM user WHERE id = ?;',
        //         [userId],
        //         function (error, results, fields) {
        //             connection.release()

        //             res.status(200).json({
        //                 status: 200,
        //                 result: results[0],
        //             })
        //         }
        //     )
        // })
    },

    //UC-204
    getUserById: (req, res) => {
        const userId = req.params.userId
        console.log(`User with ID ${userId} requested`)
        let sqlGetByID = 'SELECT * FROM user WHERE id = ?;'

        pool.query(sqlGetByID, userId, function (error, results) {
            if (error) throw error

            if (results.length > 0) {
                res.status(200).json({
                    status: 200,
                    result: results[0],
                })
            } else {
                res.status(404).json({
                    status: 404,
                    result: `User with ID ${userId} could not be found`,
                })
            }
        })
    },

    //UC-206
    deleteUser: (req, res) => {
        const userId = req.params.userId
        let user
        console.log(`User with ID ${userId} requested to be deleted`)
        let sqlDelete = 'DELETE FORM user WHERE id = ?;'
        pool.query(sqlDelete, userId, function (error, results) {
            if (error) throw error

            if (results.affectedRows > 0) {
                res.status(200).json({
                    status: 200,
                    message: `User with ID ${userId} succesfully deleted`,
                })
            } else {
                res.status(400).json({
                    status: 400,
                    message: `User does not exist`,
                })
            }
        })
    },

    //UC-205
    updateUser: (req, res) => {
        const userId = req.params.userId
        const updateUser = req.body
        console.log(`User with ID ${userId} requested to be updated`)
        let sqlUpdate =
            'UPDATE user SET firstName=?, lastName=?, isActive=?, emailAdress=?, password=?, phoneNumber=?, street=?, city=? WHERE id = ?;'
        let sqlUpdatedUser =
            'SELECT id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber FROM user WHERE id = ?;'
        pool.query(
            sqlUpdate,
            [
                updateUser.firstName,
                updateUser.lastName,
                updateUser.isActive,
                updateUser.emailAdress,
                updateUser.phoneNumber,
                updateUser.street,
                updateUser.city,
                userId,
            ],
            function (error, results) {
                if (error) {
                    res.status(200).json({
                        status: 401,
                        message: 'Update failed, provided email already taken',
                    })
                } else if (results.affectedRows > 0) {
                    pool.query(
                        sqlUpdatedUser,
                        [userId],
                        function (error, results) {
                            res.status(200).json({
                                status: 200,
                                result: results[0],
                            })
                        }
                    )
                } else {
                    res.status(400).json({
                        status: 200,
                        result: `Updating user not possible, user with ID ${userId} does not exist`,
                    })
                }
            }
        )
    },

    //UC-202
    getAll: (req, res, next) => {
        console.log('getAll aangeroepen')
        let sqlGetall = 'SELECT * FROM User;'

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

    validateUser: (req, res, next) => {
        const { firstName, lastName, city, emailAdress, phonenumber } = req.body
        try {
            assert.match(
                emailAdress,
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'The emailaddress is not valid'
            )
            assert.equal(
                typeof firstName,
                'string',
                'First name must be a string'
            )
            assert.equal(
                typeof lastName,
                'string',
                'Last name must be a string'
            )
            assert.equal(typeof city, 'string', 'City must be a string')
            assert.equal(
                typeof emailAdress,
                'string',
                'Emailadress must be a string'
            )
            next()
        } catch (err) {
            console.log(`Error message: ${err.message}`)
            console.log(`Error code: ${err.code}`)
            res.status(400).json({
                statusCode: 400,
                error: err.message,
            })
        }
    },
}

module.exports = userController
