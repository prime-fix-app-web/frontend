/**
 * Represents a Diagnosis entity in the Data Collection Bounded Context.
 * @class
 */
export class Diagnostic {
    /**
     * Creates a new Diagnostic instance
     * @param {Object} params - The parameters for the Diagnostic.
     * @param {?number} [id] - The unique identifier for the Diagnostic.
     * @param {number} [price] - The price associated with the Diagnostic.
     * @param {?number} [vehicle_id] - The identifier for the associated vehicle.
     * @param {string} [diagnosis] - The diagnosis details.
     */
    constructor({id=null, price=0.0, vehicle_id=null, diagnosis=''}){
        this.id=id;
        this.price=price;
        this.vehicle_id=vehicle_id;
        this.diagnosis=diagnosis;
    }
}
