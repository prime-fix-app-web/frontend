/**
 * Represents a AutoRepair entity
 * @class
 */
export class AutoRepair{

    /**
     * Creates a new AutoRepair instance
     * @param {Object} params - The parameters for the tutorial.
     * @param {string}[params.id_auto_repair=''] - The unique identifier for the auto repair.
     * @param {string}[params.RUC=''] - The RUC of the auto repair.
     * @param {string}[params.contact_email=''] - The contact email of the auto repair.
     * @param {?number}[params.technician_count=null] - The technician accountant of the auto repair .
     */
    constructor({id_auto_repair='',RUC='',contact_email='',technician_count=null}) {

        this.id_auto_repair=id_auto_repair;
        this.contact_email=contact_email;
        this.RUC=RUC;
        this.technician_count=technician_count;

    }

}