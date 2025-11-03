// Domain entity for Rating within Owner bounded context
// Mapea los nombres del recurso (API) a propiedades de dominio simples
export class Rating {
  /**
   * @param {Object} params
   * @param {string} [params.id_rating]
   * @param {number|string} [params.star_rating]
   * @param {string} [params.comment]
   * @param {string|number} [params.id_auto_repair]
   * @param {string|number} [params.auto_repair_id]
   * @param {string} [params.id_user_account]
   */
  constructor({ id_rating = '', star_rating = 0, comment = '', id_auto_repair = '', auto_repair_id = '', id_user_account = '' } = {}) {
    this.id = id_rating;
    this.stars = Number(star_rating) || 0;
    this.comment = comment;
    // Soporta ambas convenciones
    this.autoRepairId = id_auto_repair || auto_repair_id;
    this.userAccountId = id_user_account;
  }
}
