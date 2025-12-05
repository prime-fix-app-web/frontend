/**
 * Represents an Auto Repair entity in the Auto Repair Catalog domain.
 * @class
 */
export class AutoRepair {
    /**
     * Creates an instance of AutoRepair.
     * @param {Object} params - AutoRepair parameters
     * @param {?number}[id] - AutoRepair unique identifier
     * @param {string}[contact_email] - Contact email of the auto repair
     * @param {number}[technicians_count] - Number of technicians in the auto repair
     * @param {string}[ruc] - RUC of the auto repair
     * @param {?number}[user_account_id] - Associated user account identifier
     */
    constructor({id = null, contact_email='',technicians_count=0,ruc='', user_account_id=null}){
        this.id = id;
        this.contact_email = contact_email;
        this.technicians_count = technicians_count;
        this.ruc = ruc;
        this.user_account_id = user_account_id;
    }
}
