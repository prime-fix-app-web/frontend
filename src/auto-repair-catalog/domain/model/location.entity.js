export class Location {
    /**
     * @param {Object} params
     * @param {string}[params.id_location]
     * @param {string}[params.address]
     * @param {string}[params.district]
     * @param {string}[params.department]
     */
    constructor({id_location='', address='', district='', department=''}){
        this.id_location = id_location;
        this.address = address;
        this.district = district;
        this.department = department;
    }
}