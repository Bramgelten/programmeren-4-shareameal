const assert = require('assert')
const pool = require('../../dbconnection')
const jwt = require('jsonwebtoken')
const jwtSecretKey = require('../config/config').jwtSecretKey
const logger = require('../config/config').logger
const bcrypt = require('bcrypt')
const { count } = require('console')
const saltRounds = 10

const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/

let authController = {
    login: (req, res, next) => {
        //Assert for validation
        const emailadres = req.body.emailAdress
        let wachtwoord = req.body.password
        logger.debug(emailadres, wachtwoord)
        const sqlLogin =
            'SELECT emailAdress, password FROM User WHERE emailAdress = ?'

        pool.query(sqlLogin, [emailadres], function (error, results, fields) {
            // Handle error after the release.
            if (error) {
                logger.error('Error: ', error.toString())
                res.status(500).json({
                    error: error.toString(),
                    datetime: new Date().toISOString(),
                })
            }
            if (results && results.length === 1) {
                logger.debug(results[0].password)
                // User found with this emailaddress
                // Check if password's correct
                bcrypt
                    .compare(wachtwoord, results[0].password)
                    .then((match) => {
                        if (match) {
                            // Send JWT
                            logger.info(
                                'passwords matched, sending userinfo en valid token.'
                            )

                            const { password, ...userinfo } = results[0]
                            const payload = {
                                emailadres: userinfo.emailadres,
                            }

                            logger.debug(payload)

                            jwt.sign(
                                payload,
                                jwtSecretKey,
                                { expiresIn: '25d' },
                                function (err, token) {
                                    if (err) throw err
                                    if (token) {
                                        logger.info(
                                            'User logged in, sending: ',
                                            userinfo
                                        )
                                        res.status(200).json({
                                            status: 200,
                                            result: { ...userinfo, token },
                                        })
                                    }
                                    logger.debug('Logged in')
                                }
                            )
                        } else {
                            logger.info('Password invalid')
                            res.status(401).json({
                                status: 401,
                                message: 'Wachtwoord ongeldig.',
                                datetime: new Date().toISOString,
                            })
                        }
                    })
            }
        })
    },
    validateLogin: (req, res, next) => {
        //Make sure you have the expected input
        logger.debug('Validate login called')
        let emailIsValid = emailRegex.test(req.body.emailAdress)
        let passwordIsValid = passwordRegex.test(req.body.password)

        try {
            assert(
                typeof req.body.emailAdress === 'string',
                'email must be a string.'
            )
            assert(
                typeof req.body.password === 'string',
                'password must be a string.'
            )
            logger.debug('Both email and password are strings')
            assert(
                emailIsValid,
                'Email is invalid. Make sure to have characters before and after the @ and that the domain length after the . is either 2 or 3'
            )
            assert(
                passwordIsValid,
                'Password is invalid. Make sure the password has at least a uppercase letter, one digit and is 8 characters long'
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
    validateToken(req, res, next) {
        logger.info('validateToken called')
        // logger.trace(req.headers)
        // The headers should contain the authorization-field with value 'Bearer [token]'
        const authHeader = req.headers.authorization
        if (!authHeader) {
            logger.warn('Authorization header missing!')
            res.status(401).json({
                status: 401,
                message: 'User is not logged in',
                // datetime: new Date().toISOString(),
            })
        } else {
            // Strip the word 'Bearer ' from the headervalue
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    logger.warn('Not authorized')
                    res.status(401).json({
                        status: 401,
                        message: 'Not authorized',
                        // datetime: new Date().toISOString(),
                    })
                }
                if (payload) {
                    logger.debug('token is valid', payload)
                    // User heeft toegang. Voeg UserId uit payload toe aan
                    // request, voor ieder volgend endpoint.
                    req.userId = payload.userId
                    next()
                }
            })
        }
    },
    validateOwnership(req, res, next) {
        const userId = req.userId
        const mealId = req.params.mealId

        sqlOwnership = 'SELECT * FROM meal WHERE id = ?;'

        pool.query(sqlOwnership, [mealId], function (error, results, fields) {
            if (error) throw error

            if (results[0]) {
                const cookId = results[0].cookId
                if (userId !== cookId) {
                    res.status(403).json({
                        status: 403,
                        message:
                            'User is not the owner of the meal that is being requested to be deleted or updated',
                    })
                } else {
                    next()
                }
            } else {
                next()
            }
        })
    },
}

module.exports = authController
