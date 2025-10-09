/**
 * Represents an auto repair shop entity.
 * @class
 */
export class AutoRepair {
    /**
     * Creates an instance of AutoRepair.
     * @param {Object} params - The parameters for the auto repair shop.
     * @param {string} [params.id_auto_repair=''] - The unique identifier of the auto repair shop.
     * @param {string} [params.RUC=''] - The RUC (Unique Taxpayer Registry) of the auto repair shop.
     * @param {string} [params.contact_email=''] - The contact email of the auto repair shop.
     * @param {?number} [params.technicians_count=null] - The total number of technicians working in the shop.
     * @param {string} [params.id_location=''] - The identifier for the location of the auto repair shop.
     */
    constructor({id_auto_repair = '', RUC = '', contact_email = '', technicians_count = null, id_location = '',}) {
        this._id_auto_repair = id_auto_repair;
        this._RUC = RUC;
        this._contact_email = contact_email;
        this._technicians_count = technicians_count;
        this._id_location = id_location;
    }
}
