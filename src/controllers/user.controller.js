const dbconnection = require('../../database/dbconnection')
const assert = require('assert')
const logger = require('../config/config').logger

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
        const userId = req.userId;
        logger.debug(`Personal profile of user with ID ${userId} requested`);
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; 
            connection.query('SELECT * FROM user WHERE id = ?;', [userId], function (error, results, fields) {
                connection.release();

                res.status(200).json({
                    status: 200,
                    result: results[0],
                });
            });
        });
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
    getAllUsers:(req,res) => {
        let query = 'SELECT * FROM user;';
        if(/\?.+/.test(req.url)){
            const searchTerms = req.query;
            const firstName = searchTerms.firstName
            let isActive = searchTerms.isActive
            if(isActive != undefined){
                if(isActive == "true"){
                    isActive=1;
                } else {
                    isActive=0;
                }
            }

            if(firstName != undefined && isActive != undefined){
                query = `SELECT * FROM user WHERE firstName = '${firstName}' AND isActive = ${isActive}`;
            } else if (firstName == undefined && isActive != undefined){
                query = `SELECT * FROM user WHERE isActive = ${isActive};`;
            } else {
                query = `SELECT * FROM user WHERE firstName = '${firstName}';`;
            }
        };
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; 
            logger.debug(query);
            connection.query(query, function (error, results, fields) {
                if (error) throw error; 
                connection.release();
                logger.debug('Amount of results: ',results.length);
                for (let i = 0; i < results.length; i++) {
                    results[i].isActive = (results[i].isActive) ? true : false;
                }
                res.status(200).json({
                    status: 200,
                    result: results,
                });
            });
        });
    },

    validateUser: (req, res, next) => {
        let user = req.body;
        let { firstName, lastName, street, city, password, emailAdress } = user;
        try{
            assert.match(password, /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "Password must contain min. 8 characters which contains at least one lower- and uppercase letter, and one digit");
            assert.match(emailAdress, /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "The provided Emailadress format is invalid");

            assert(typeof firstName === "string", "First name must be a string");
            assert(typeof lastName === "string", "Last name must be a string");
            assert(typeof password === "string", "Password must be a string");
            assert(typeof emailAdress === "string", "Email adress must be a string");
            assert(typeof street === "string", "Street must be a string");
            assert(typeof city === "string", "City must be a string");
            next();
        } catch(err){
            const error={
                status: 400,
                message: err.message
            };
            next(error);
        }
    },

    validateUpdateUser:(req,res,next)=>{
        let user = req.body;
        let { phoneNumber } = user;
        try{
            assert(typeof phoneNumber === "string", "Phonenumber must be a string");
            //regex for valid dutch phonenumber
            assert.match(phoneNumber, /(^\+[0-9]{2}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0)([0-9]{9}$|[0-9\-\s]{10}$)/, "Phonenumber must be 10 digits long, example: 0612345678")
            next();
        } catch(err){
            const error={
                status: 400,
                message: err.message
            };
            next(error);
        }
    },
}
