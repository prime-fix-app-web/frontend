/**
 * Represents a Vehicle entity
 * @class
 */
export class Vehicle {
    /**
     * Creates a new Vehicle instance
     * @param {Object} params - The parameters for the vehicle.
     * @param {string} [params.id_vehicle=''] - The unique identifier for the vehicle.
     * @param {string}[params.color=''] - The color of the vehicle.
     * @param {string}[params.model=''] - The model of the vehicle.
     * @param {string} [params.id_user=''] - The unique identifier for the user.
     * @param {string}[params.vehicle_brand=''] - The brand of the vehicle.
     * @param {string}[params.vehicle_plate=''] - The plate of the vehicle.
     * @param {string}[params.vehicle_type=''] - The type of the vehicle.
     */
    constructor({id_vehicle='',color = '', model='', id_user='', vehicle_brand='',
                vehicle_plate='', vehicle_type=''}){
        this.id_vehicle=id_vehicle;
        this.color=color;
        this.model=model;
        this.id_user=id_user;
        this.vehicle_brand=vehicle_brand;
        this.vehicle_plate=vehicle_plate;
        this.vehicle_type=vehicle_type;
    }
}