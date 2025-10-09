/**
 * Represents a user in the system.
 * @class
 */
export class User {
    /**
     * Creates an instance of User.
     * @param {Object} params - The parameters for the user.
     * @param {string} id_user - The unique identifier for the user.
     * @param {string} name - The first name of the user.
     * @param {string} last_name - The last name of the user.
     * @param {string} dni - The national identification number of the user.
     * @param {string} phone_number - The phone number of the user.
     * @param {string} id_location - The identifier for the user's location.
     */
    constructor({ id_user = '', name = '', last_name = '', dni = '',
                    phone_number = '', id_location = ''}) {
        this.id = id_user;
        this.name = name;
        this.last_name = last_name;
        this.dni = dni;
        this.phone_number = phone_number;
        this.id_location = id_location;
    }
}