/**
 * Represents a Technician entity in the Auto Repair Register Bounded Context.
 * @class
 */
export class Technician {

    /**
     * Creates a new Technician instance
     * @param {Object} params - The parameters for the Technician.
     * @param {?number} [id] - The unique identifier of the technician.
     * @param {string} [name] - The first name of the technician.
     * @param {string} [last_name] - The last name of the technician.
     * @param {?number} [auto_repair_id] - The identifier of the associated auto repair shop.
     */
    constructor({id=null, name='', last_name='',auto_repair_id=null}){
        this.id = id;
        this.name = name;
        this.last_name = last_name;
        this.auto_repair_id = auto_repair_id
    }
}