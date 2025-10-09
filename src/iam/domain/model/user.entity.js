export class User {
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