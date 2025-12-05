/**
 * Represents a Vehicle entity.
 * @class
 */
export class Vehicle {
    /**
     * Creates a new Category instance.
     * @param {Object} params - The parameters for the vehicle.
     * @param {?number} [params.id=null] - The unique identifier for the vehicle.
     * @param {string} [params.model=''] - The model of the vehicle.
     * @param {?number} [params.user_id=''] - The id of the auto-repair-catalog of the vehicle.
     * @param {string} [params.vehicle_brand=''] - The brand of the vehicle.
     * @param {string} [params.vehicle_plate=''] - The plate of the vehicle.
     * @param {string} [params.vehicle_type=''] - The type of the vehicle.
     * @param {string} [params.color=''] - The color of the vehicle.
     * @param {number} [params.maintenance_status=0] - The maintenance state of the vehicle.
     */
    constructor({id = null, model = '', user_id = null, vehicle_brand = '', vehicle_plate = '',
                    vehicle_type = '', color = '' , maintenance_status=0}) {
        this.id = id;
        this.model = model;
        this.user_id = user_id;
        this.vehicle_brand = vehicle_brand;
        this.vehicle_plate = vehicle_plate;
        this.vehicle_type = vehicle_type;
        this.color = color;
        this.maintenance_status =maintenance_status;
    }
}