/**
 * UserAccount Entity in the IAM Bounded Context.
 * @class
 */
export class UserAccount {
    /**
     * Creates an instance of UserAccount.
     * @param {Object} params - The parameters for the user account.
     * @param {?number} id - The unique identifier for the user account.
     * @param {string} email -  The email of the user account.
     * @param {string} username - The username of the user account.
     * @param {string} password - The password of the user account.
     * @param {boolean} is_new - Indicates if the account is new.
     * @param {?number} user_id - The identifier for the associated user.
     * @param {?number} role_id - The identifier for the associated role.
     * @param {?number} membership_id - The identifier for the associated membership.
     */
    constructor({ id = null, username = '', email = '',
                    user_id = null, role_id = null, membership_id = null, password = '', is_new = false }) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.user_id = user_id;
        this.role_id = role_id;
        this.membership_id = membership_id;
        this.password = password;
        this.is_new = is_new;
    }
}