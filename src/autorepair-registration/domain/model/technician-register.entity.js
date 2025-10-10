/**
 * Represents a technician who works at an auto repair shop.
 * @class
 */
export class Technician {
    /**
     * Creates an instance of Technician.
     * @param {Object} params - The parameters for the technician.
     * @param {string} [params.id_user_account=''] - The unique identifier for the technician.
     * @param {string} [params.username=''] - The full name of the technician.
     * @param {string} [params.email=null] - The age of the technician.
     * @param {string} [params.id_role=''] - The identifier of the auto repair shop the technician belongs to.
     */

    constructor({id_user_account = '', username = '', email = ' ', id_role = '',}) {
        this.id_user_account = id_user_account
        this.username = username
        this.email = email
        this.id_role = id_role
    }
}