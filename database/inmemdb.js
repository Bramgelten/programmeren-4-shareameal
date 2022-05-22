// Deze variabelen worden niet geëxporteerd en kunnen dus niet
// vanuit andere bestanden gewijzigd worden - alleen via de databasefuncties.
const _userdb = []
const timeout = 500 // msec
let id = 0

// Dit is het object dat geexporteerd wordt, en dus in andere JavaScript bestanden geïmporteerd kan worden, via require.
module.exports = {
    /**
     * Maak een nieuwe user aan in de database. De naam van de user moet uniek zijn.
     *
     * @param {*} user De user die we toevoegen
     * @param {*} callback De functie die ofwel een error, ofwel een resultaat teruggeeft.
     */
    createUser(user, callback) {
        console.log('createUser called')
        // we simuleren hier dat de database query 'lang' duurt, door een setTimeout toe te voegen.
        setTimeout(() => {
            // de naam van de user moet uniek zijn.
            // controleer daarom eerst of er al een user met die naam in de _userdb zit.
            if (
                user &&
                user.name &&
                _userdb.filter((item) => item.name === user.name).length > 0
            ) {
                const error = 'A user with this name already exists.'
                console.log(error)
                // roep de callback functie aan met error als resultaat, en result = undefined.
                callback(error, undefined)
            } else {
                // voeg de id toe aan de user, in de moveToAdd
                const userToAdd = {
                    id: id++,
                    ...user,
                    isActive: false,
                }

                _userdb.push(userToAdd)
                // roep de callback aan, zonder error, maar met de nieuwe user als result.
                callback(undefined, userToAdd)
            }
        }, timeout)
    },

    /**
     * Retourneer een lijst van alle users.
     * Om alle users op te halen hebben we geen input param nodig,
     * dus alleen een callback als parameter.
     *
     * @param {*} callback De functie die het resultaat retourneert.
     */
    listUsers(callback) {
        console.log('lisUsers called')
        setTimeout(() => {
            // roep de callback aan, zonder error, maar met de hele userdb als result.
            callback(undefined, _userdb)
        }, timeout)
    },

    getUserById(userId, callback) {
        setTimeout(() => {
            let filteredUsers = _userdb.filter((item) => item.id === userId)
            if (filteredUsers.length > 0) {
                console.log(user)
                callback(undefined, filteredUsers[0])
            } else {
                const error = {
                    status: 401,
                    message: `User with ID ${userId} not found`,
                }
                callback(error, undefined)
            }
        }, timeout)
    },

    updateUserById(userId, updateUser, callback) {
        let updatedUser = []
        setTimeout(() => {
            // vind user binnen de database array
            _userdb.forEach((item, index, array) => {
                if (item.id == userId) {
                    // gevonden user updaten door de meegegeven properties van het updatedUser object
                    array[index] = {
                        ...array[index],
                        ...update,
                    }
                    // updated user opslaan voor callback
                    updatedUser.push(array[index])
                }
            })
            if (updatedUser.length > 0) {
                callback(undefined, updatedUser)
            } else {
                const error = {
                    status: 404,
                    message: `User with ID ${userId} not found`,
                }
                callback(error, undefined)
            }
        }, timeout)
    },

    deleteUserById: (userId, callback) => {
        let deletedUser = []
        setTimeout(() => {
            _userdb.forEach((item, index, array) => {
                if (item.id == userId) {
                    // verwijderde user opslaan voor callback
                    deletedUser.push(array[index])
                    // gevonden user uit de database verwijderen
                    array.splice(index, 1)
                }
            })
            if (deletedUser.length > 0) {
                callback(undefined, deletedUser)
            } else {
                const error = {
                    status: 404,
                    message: `User with ID ${userId} not found`,
                }
                callback(error, undefined)
            }
        }, timeout)
    },
}
