const database = require('../../database/inmemdb')
const dbconnection = require('../../database/dbconnection')
const assert = require('assert')

/**
 * We exporteren hier een object. Dat object heeft attributen met een waarde.
 * Die waarde kan een string, number, boolean, array, maar ook een functie zijn.
 * In dit geval zijn de attributen functies.
 */
module.exports = {
    // createUser is een attribuut dat als waarde een functie heeft.

    //UC-201
    createUser: (req, res) => {
        let user = req.body
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            connection.query(
                'INSERT INTO user (firstName, lastName, street, city, phoneNumber, emailAdress, password) VALUES(?, ?, ?, ?, ?, ?, ?);',
                [
                    user.firstName,
                    user.lastName,
                    user.street,
                    user.city,
                    user.phoneNumber,
                    user.emailAdress,
                    user.password,
                ],
                function (error, result, fields) {
                    if (error) {
                        connection.release()
                        res.status(409).json({
                            status: 409,
                            result: `A user with ${user.emailAdress} already exists`,
                        })
                    } else {
                        connection.release()
                        res.status(201).json({
                            status: 201,
                            result: `User has been added`,
                        })
                    }
                }
            )
        })
    },
    //UC-203
    getUserProfile: (req, res) => {
        res.status(203).json({
            status: 203,
            result: 'This endpoint has not been defined yet.',
        })
    },

    //UC-204
    getUserById: (req, res) => {
        const userId = req.params.userId
        console.log(`User with ID ${userId} requested`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            connection.query(
                'SELECT * FROM user WHERE id = ?;',
                [userId],
                function (error, results, fields) {
                    connection.release()
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
                }
            )
        })
    },

    //UC-206
    deleteUser: (req, res) => {
        const userId = req.params.userId
        let user
        console.log(`User with ID ${userId} requested to be deleted`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err

            connection.query(
                'DELETE FROM user WHERE id = ?;',
                [userId],
                function (error, results, fields) {
                    connection.release()
                    if (error) throw error

                    if (results.affectedRows > 0) {
                        res.status(200).json({
                            status: 200,
                            result: `User with ID ${userId} succesfully deleted`,
                        })
                    } else {
                        res.status(400).json({
                            status: 400,
                            result: `User with ID ${userId} not found, and could not be deleted`,
                        })
                    }
                }
            )
        })
    },

    //UC-205
    updateUser: (req, res) => {
        const userId = req.params.userId
        const updateUser = req.body
        console.log(`User with ID ${userId} requested to be updated`)
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err
            connection.query(
                'UPDATE user SET firstName=?, lastName=?, isActive=?, emailAdress=?, password=?, phoneNumber=?, street=?, city=? WHERE id = ?;',
                [
                    updateUser.firstName,
                    updateUser.lastName,
                    updateUser.isActive,
                    updateUser.emailAdress,
                    updateUser.password,
                    updateUser.phoneNumber,
                    updateUser.street,
                    updateUser.city,
                    userId,
                ],
                function (error, results, fields) {
                    if (error) {
                        res.status(401).json({
                            status: 401,
                            result: `Updating user not possible, provided email already taken`,
                        })
                        return
                    }
                    if (results.affectedRows > 0) {
                        connection.query(
                            'SELECT id, firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber FROM user WHERE id = ?;',
                            [userId],
                            function (error, results, fields) {
                                res.status(200).json({
                                    status: 200,
                                    result: results[0],
                                })
                            }
                        )
                    } else {
                        res.status(400).json({
                            status: 400,
                            result: `Updating user not possible, user with ID ${userId} does not exist`,
                        })
                    }
                }
            )
            connection.release()
        })
    },

    //UC-202
    getAll: (req, res, next) => {
        console.log('getAll aangeroepen')
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                'SELECT * FROM user;',
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) throw error

                    // Don't use the connection here, it has been returned to the pool.
                    console.log('#results = ', results.length)
                    res.status(200).json({
                        statusCode: 200,
                        results: results,
                    })
                }
            )
        })
    },

    validateUser: (req, res, next) => {
        // We krijgen een user object binnen via de req.body.
        // Dat object splitsen we hier via object decomposition
        // in de afzonderlijke attributen.
        const { firstName, lastName, city, emailAdress, phonenumber } = req.body
        try {
            // assert is een nodejs library om attribuutwaarden te valideren.
            // Bij een true gaan we verder, bij een false volgt een exception die we opvangen.
            assert.match(emailAdress,/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,'The emailaddress is not valid')
            assert.equal(typeof firstName,'string','First name must be a string')
            assert.equal(typeof lastName,'string','Last name must be a string')
            assert.equal(typeof city, 'string', 'City must be a string')
            assert.equal(typeof emailAdress,'string','Emailadress must be a string')
            // als er geen exceptions waren gaan we naar de next routehandler functie.
            next()
        } catch (err) {
            // Hier kom je als een assert failt.
            console.log(`Error message: ${err.message}`)
            console.log(`Error code: ${err.code}`)
            // Hier geven we een generiek errorobject terug. Dat moet voor alle
            // foutsituaties dezelfde structuur hebben. Het is nog mooier om dat
            // via de Express errorhandler te doen; dan heb je één plek waar je
            // alle errors afhandelt.
            // zie de Express handleiding op https://expressjs.com/en/guide/error-handling.html
            res.status(400).json({
                statusCode: 400,
                error: err.message,
            })
        }
    },
}
