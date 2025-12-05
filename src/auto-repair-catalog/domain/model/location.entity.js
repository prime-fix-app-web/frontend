/**
 * Represents a Location entity in the Auto Repair Catalog domain.
 * @class
 */
export class Location {
    /**
     * Creates an instance of Location.
     * @param {Object} params - Location parameters
     * @param {?number}[params.id] - Location unique identifier
     * @param {string}[params.address] - Location address
     * @param {string}[params.district] - Location district
     * @param {string}[params.department] - Location department
     */
    constructor({id=null, address='', district='', department=''}){
        this.id = id;
        this.address = address;
        this.district = district;
        this.department = department;
    }
}