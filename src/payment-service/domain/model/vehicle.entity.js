/**
 * Represents a Vehicle entity.
 * @class
 */
export class Vehicle {
    /**
     * Creates a new Category instance.
     * @param {Object} params - The parameters for the vehicle.
     * @param {string} [params.id_vehicle=''] - The unique identifier for the vehicle.
     * @param {string} [params.model=''] - The model of the vehicle.
     * @param {string} [params.id_user=''] - The id of the auto-repair-catalog of the vehicle.
     * @param {string} [params.vehicle_brand=''] - The brand of the vehicle.
     * @param {string} [params.vehicle_plate=''] - The plate of the vehicle.
     * @param {string} [params.vehicle_type=''] - The type of the vehicle.
     * @param {string} [params.color=''] - The color of the vehicle.
     *
     */
    constructor({id_vehicle = '', model = '', id_user = '', vehicle_brand = '', vehicle_plate = '', vehicle_type = '', color = '' }) {
        this.id = id_vehicle;
        this.model = model;
        this.id_user = id_user;
        this.vehicle_brand = vehicle_brand;
        this.vehicle_plate = vehicle_plate;
        this.vehicle_type = vehicle_type;
        this.color = color;
    }
}