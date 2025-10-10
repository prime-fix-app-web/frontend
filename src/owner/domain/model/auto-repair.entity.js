// Domain entity for AutoRepair within Owner bounded context
export class AutoRepair {
  /**
   * @param {Object} params
   * @param {string} [params.id_auto_repair]
   * @param {string} [params.ruc]
   * @param {string} [params.contact_email]
   * @param {number} [params.technicians_count]
   * @param {string} [params.id_location]
   */
  constructor({ id_auto_repair = '', ruc = '', contact_email = '', technicians_count = 0, id_location = '' } = {}) {
    this.id = id_auto_repair;
    this.ruc = ruc;
    this.contactEmail = contact_email;
    this.techniciansCount = technicians_count;
    this.locationId = id_location;
  }
}

