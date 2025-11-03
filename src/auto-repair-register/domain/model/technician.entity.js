/**
 * Represents a Technician entity
 * @class
 */
export class Technician {

    /**
     * Creates a new Technician instance
     * @param {Object} params - The parameters for the Technician.
     * @param [id_technician]
     * @param [name]
     * @param [last_name]
     * @param [id_auto_repair]
     */
    constructor({id_technician='', name='', last_name='',id_auto_repair=''}){
        this.id_technician=id_technician;
        this.name=name;
        this.last_name=last_name;
        this.id_auto_repair=id_auto_repair
    }
}