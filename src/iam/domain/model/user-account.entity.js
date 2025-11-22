/**
 * UserAccount Entity
 * @class
 */
export class UserAccount {
    /**
     * Creates an instance of UserAccount.
     * @param {Object} params - The parameters for the user account.
     * @param {string} id_user_account - The unique identifier for the user account.
     * @param {string} username - The username of the user account.
     * @param {string} email -  The email of the user account.
     * @param {string} id_user - The identifier for the associated user.
     * @param {string} id_role - The identifier for the associated role.
     * @param {string} id_membership - The identifier for the associated membership.
     * @param {string} password - The password of the user account.
     */
    constructor({ id_user_account = '', username = '', email = '',
                    id_user = '', id_role = '', id_membership = '', password = '' }) {
        this.id_user_account = id_user_account;
        this.username = username;
        this.email = email;
        this.id_user = id_user;
        this.id_role = id_role;
        this.id_membership = id_membership;
        this.password = password;
    }

    /** Getters and setters  */
    get id() { return this.id_user_account; }
    set id(value) { this.id_user_account = value; }
}