// Domain entity for AutoRepair within Owner bounded context
export class AutoRepair {
  /**
   * @param {Object} params
   * @param {string} [params.id_auto_repair]
   * @param {string} [params.id]
   * @param {string} [params.ruc]
   * @param {string} [params.contact_email]
   * @param {string} [params.contactEmail]
   * @param {number} [params.technicians_count]
   * @param {string} [params.id_location]
   * @param {string|number} [params.location_id]
   */
  constructor({ id_auto_repair = '', id = '', ruc = '', contact_email = '', contactEmail = '', technicians_count = 0, id_location = '', location_id = '' } = {}) {
    // id: admite tanto id_auto_repair como id
    this.id = id_auto_repair || id;
    this.ruc = ruc;
    // normaliza email
    this.contactEmail = contact_email || contactEmail || '';
    this.techniciansCount = technicians_count;
    // location por id_location (código) o location_id (pk)
    this.locationId = id_location || '';
    this.locationPk = location_id || '';
  }
}
