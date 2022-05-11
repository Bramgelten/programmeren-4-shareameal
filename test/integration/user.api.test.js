process.env.DB_DATABASE = process.env.DB_DATABASE || 'shareameal'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../database/dbconnection')

chai.should()
chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert studenthomes.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de UserId, die moet matchen
 * met de user die je ook toevoegt.

const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);" */

describe('Users API', () => {
    //
    // informatie over before, after, beforeEach, afterEach:
    // https://mochajs.org/#hooks
    //
    before((done) => {
        console.log(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        )
        console.log('before done')
        done()
    })

    describe('UC-201 Creating a user', () => {
        //
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        it('TC-201-1 should return valid error when required value is not present', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    //no first name
                    lastName: 'Gelten',
                    street: 'Slingerstraat 25',
                    city: 'Ossendrecht',
                    password: 'dfd4445SAD!',
                    emailAdress: 'bramgelten@gmail.com',
                })
                .end((err, res) => {
                    assert.ifError(err)
                    res.should.have.status(400)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('statusCode', 'error')

                    let { statusCode, error } = res.body
                    statusCode.should.be.an('number')
                    error.should.be
                        .an('string')
                        .that.contains('First name must be a string')

                    done()
                })
        })

        xit('TC-201-2 should return a valid error when emailaddres is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'Bram',
                    lastName: 'Gelten',
                    street: 'Slingerstraat 25',
                    city: 'Ossendrecht',
                    password: 'dfd4445SAD!',
                    emailAdress: 'bramgeltengmail.com',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(400)
                    result.should.be
                        .a('string')
                        .that.equals('The emailaddress is not valid')
                    done()
                })
        })

        xit('TC-201-3 should return a valid error when password is invalid', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'Bram',
                    lastName: 'Gelten',
                    street: 'Slingerstraat 25',
                    city: 'Ossendrecht',
                    password: 'dfd4445SAD!',
                    emailAdress: 'bramgeltengmail.com',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(400)
                    result.should.be
                        .a('string')
                        .that.equals('The password is not valid')
                    done()
                })
        })

        it('TC-201-4 should return a valid error when emailaddres already exists in database', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'Bram',
                    lastName: 'Gelten',
                    street: 'Slingerstraat 25',
                    city: 'Ossendrecht',
                    password: 'dfd4445SAD!',
                    emailAdress: 'name@server.nl',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(409)
                    result.should.be
                        .a('string')
                        .that.equals(
                            'A user with name@server.nl already exists'
                        )
                    done()
                })
        })

        it('TC-201-5 succesful adding of user', (done) => {
            chai.request(server)
                .post('/api/user')
                .send({
                    firstName: 'Bram',
                    lastName: 'Gelten',
                    street: 'Slingerstraat 25',
                    city: 'Ossendrecht',
                    password: 'dfd4445SAD!',
                    emailAdress: 'riekkusgelten@gmail.com',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(201)
                    result.should.be
                        .a('string')
                        .that.equals('User has been added')
                    done()
                })
        })
    })

    describe('UC-204 Requesting details of a user', () => {
        it('TC-204-2 User ID does not exist', (done) => {
            chai.request(server)
                .get('/api/user/9999')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(404)
                    result.should.be
                        .a('string')
                        .that.equals('User with ID 9999 could not be found')
                    done()
                })
        })

        it('TC-204-3 User ID exists', (done) => {
            chai.request(server)
                .get('/api/user/1')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    assert.deepEqual(result, {
                        id: 1,
                        firstName: 'first',
                        lastName: 'last',
                        isActive: 1,
                        emailAdress: 'name@server.nl',
                        password: 'secret',
                        phoneNumber: '-',
                        roles: 'editor,guest',
                        street: 'street',
                        city: 'city',
                    })
                    done()
                })
        })
    })

    describe('UC-205 Updating a user', () => {
        it('TC-205-1 should return valid error when required value is not present', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .send({
                    //no first name
                    lastName: 'last',
                    street: 'street',
                    city: 'city',
                    password: 'secret',
                    emailAdress: 'name@server.be',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(400)
                    result.should.be
                        .a('string')
                        .that.equals('First name must be a string')
                    done()
                })
        })

        xit('TC-205-2 should return a valid error when emailaddres is invalid', (done) => {
            chai.request(server)
                .put('/api/user/2')
                .send({
                    //no first name
                    lastName: 'Gelten',
                    street: 'Slingerstraat 25',
                    city: 'Ossendrecht',
                    password: 'dfd4445SAD!',
                    emailAdress: 'bramgelten@gmail.com',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(400)
                    result.should.be
                        .a('string')
                        .that.equals('The emailaddress is not valid')
                    done()
                })
        })

        it('TC-205-4 User to be updated does not exist', (done) => {
            chai.request(server)
                .put('/api/user/9999')
                .send({
                    firstName: 'Bram',
                    lastName: 'Gelten',
                    street: 'Slingerstraat 25',
                    city: 'Ossendrecht',
                    password: 'dfd4445SAD!',
                    emailAdress: 'bramgelten@gmail.com',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(400)
                    result.should.be
                        .a('string')
                        .that.equals(
                            'Updating user not possible, user with ID 9999 does not exist'
                        )
                    done()
                })
        })

        it('TC-205-6 User succesfully updated', (done) => {
            chai.request(server)
                .put('/api/user/1')
                .send({
                    firstName: 'first',
                    lastName: 'last',
                    street: 'street',
                    city: 'Ossendrecht',
                    password: 'secret',
                    emailAdress: 'name@server.nl',
                })
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    assert.deepEqual(result, {
                        id: 1,
                        firstName: 'first',
                        lastName: 'last',
                        street: 'street',
                        isActive: 0,
                        city: 'Ossendrecht',
                        password: 'secret',
                        emailAdress: 'name@server.nl',
                        phoneNumber: null,
                    })
                    done()
                })
        })
    })

    describe('UC-206 Deleting a user', () => {
        it('TC-206-1 User to be deleted does not exist', (done) => {
            chai.request(server)
                .delete('/api/user/9999')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(400)
                    result.should.be
                        .a('string')
                        .that.equals(
                            'User with ID 9999 not found, and could not be deleted'
                        )
                    done()
                })
        })

        it('TC-206-4 succesful deletion of user', (done) => {
            chai.request(server)
                .delete('/api/user/1')
                .end((err, res) => {
                    res.should.be.an('object')
                    let { status, result } = res.body
                    status.should.equals(200)
                    result.should.be
                        .a('string')
                        .that.equals('User with ID 1 succesfully deleted')
                    done()
                })
        })
    })

    describe('UC-303 Lijst van maaltijden opvragen /api/meal', () => {
        //
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase opnieuw aan zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!
                connection.query(
                    CLEAR_DB + INSERT_USER + INSERT_MEALS,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()
                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                        done()
                    }
                )
            })
        })

        xit('TC-303-1 Lijst van maaltijden wordt succesvol geretourneerd', (done) => {
            chai.request(server)
                .get('/api/user')
                .end((err, res) => {
                    assert.ifError(err)

                    res.should.have.status(200)
                    res.should.be.an('object')

                    res.body.should.be
                        .an('object')
                        .that.has.all.keys('results', 'statusCode')

                    let { statusCode, results } = res.body
                    statusCode.should.be.an('number')
                    results.should.be.an('array').that.has.length(2)
                    results[0].name.should.equal('Meal A')
                    results[0].id.should.equal(1)
                    done()
                })
        })
        // En hier komen meer testcases
    })
})
