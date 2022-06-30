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
}

module.exports = authController
