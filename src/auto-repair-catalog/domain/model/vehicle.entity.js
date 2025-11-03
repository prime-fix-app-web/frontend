// Domain entity for Vehicle within Owner bounded context
export class Vehicle {
  /**
   * @param {Object} params
   * @param {string} [params.id_vehicle]
   * @param {string} [params.model]
   * @param {string} [params.id_user]
   * @param {string} [params.vehicle_brand]
   * @param {string} [params.vehicle_plate]
   * @param {string} [params.vehicle_type]
   * @param {string} [params.color]
   */
  constructor({ id_vehicle = '', model = '', id_user = '', vehicle_brand = '', vehicle_plate = '', vehicle_type = '', color = '' } = {}) {
    this.id = id_vehicle;
    this.model = model;
    this.userId = id_user;
    this.brand = vehicle_brand;
    this.plate = vehicle_plate;
    this.type = vehicle_type;
    this.color = color;
  }
}

