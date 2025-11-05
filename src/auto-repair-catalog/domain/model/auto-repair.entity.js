// Domain entity for AutoRepair within Owner bounded context
export class AutoRepair {
    /**
     * @param {Object} params
     * @param {string}[id_auto_repair]
     * @param {string}[contact_email]
     * @param {number}[technicians_count]
     * @param {string}[ruc]
     * @param {string}[id_user_account]
     */
    constructor({id_auto_repair='', contact_email='',technicians_count=0,ruc='', id_user_account=''}){
        this.id_auto_repair = id_auto_repair;
        this.contact_email = contact_email;
        this.technicians_count = technicians_count;
        this.ruc = ruc;
        this.id_user_account = id_user_account;
    }
}
