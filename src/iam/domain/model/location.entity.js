/**
 * Represents a location entity.
 * @class
 */
export class Location {
    /**
     * Creates an instance of Location.
     * @param {Object} params - The parameters for the location.
     * @param {string} [params.id_location=''] - The unique identifier for the location.
     * @param {string} [params.address=''] - The address of the location.
     * @param {string} [params.district=''] - The district of the location.
     * @param {string} [params.department=''] - The department of the location.
     * @param {string|number} [params.id] - Backend raw primary key (opcional)
     */

    constructor({ id_location = '', address = '', district = '', department = '' }) {
        this.id_location = id_location;
        this.address = address;
        this.district = district;
        this.department = department;
    }

    get id() { return this.id_location; }
    set id(value) { this.id_location = value; }
}