export class UserAccount {
    constructor({ id_user_account = '', username = '', email = '',
                    id_user = '', id_role = '', id_membership = '', password = '' }) {
        this.id = id_user_account;
        this.username = username;
        this.email = email;
        this.id_user = id_user;
        this.id_role = id_role;
        this.id_membership = id_membership;
        this.password = password;
    }
}