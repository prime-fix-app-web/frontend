/**
 * Represents a technician who works at an auto repair shop.
 * @class
 */
export class Technician {
    /**
     * Creates an instance of Technician.
     * @param {Object} params - The parameters for the technician.
     * @param {string} [params.id_technician=''] - The unique identifier for the technician.
     * @param {string} [params.name=''] - The full name of the technician.
     * @param {?number} [params.age=null] - The age of the technician.
     * @param {string} [params.id_auto_repair=''] - The identifier of the auto repair shop the technician belongs to.
     */

    constructor({id_technician  = '', name = '', age = null, id_auto_repair = '',}) {
    this.id_technician = id_technician
    this.name = name
    this.age = age
    this.id_auto_repair = id_auto_repair
}
}