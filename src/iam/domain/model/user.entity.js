/**
 * Represents a user in the IAM Bounded Context.
 * @class
 */
export class User {
    /**
     * Creates an instance of User.
     * @param {Object} params - The parameters for the user.
     * @param {?number} id - The unique identifier for the user.
     * @param {string} name - The first name of the user.
     * @param {string} last_name - The last name of the user.
     * @param {string} dni - The national identification number of the user.
     * @param {string} phone_number - The phone number of the user.
     * @param {string} location_id - The identifier for the user's location.
     */
    constructor({ id = null, name = '', last_name = '', dni = '',
                    phone_number = '', location_id = null}) {
        this.id = id;
        this.name = name;
        this.last_name = last_name;
        this.dni = dni;
        this.phone_number = phone_number;
        this.location_id = location_id;
    }
}