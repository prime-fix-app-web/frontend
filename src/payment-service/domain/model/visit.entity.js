/**
 * Represents a Payment entity.
 * @class
 */
export class Visit {
    /**
     * Creates a new Category instance.
     * @param {Object} params - The parameters for the category.
     * @param {string} [params.id_visit=''] - The unique identifier for the visit.
     * @param {string} [params.failure=''] - The failure detected on the visit.
     * @param {string} [params.time_visit=''] - The date of the visit.
     * @param {string} [params.id_auto_repair=null] - The identifier for the auto repair.
     * @param {string} [params.id_service=null] - The identifier for the service.
     * @param {string} [params.status=null] - The status identifier of the visit.
     * @param {string} [params.id_vehicle=null] - The identifier for the visit.
     */
    constructor({ id_visit = '', failure = '', time_visit= '', id_auto_repair = '', id_service= '', status = '', id_vehicle=''}) {
        this.id_visit = id_visit;
        this.failure = failure;
        this.time_visit = time_visit;
        this.id_auto_repair = id_auto_repair;
        this.id_service = id_service;
        this.status = status;
        this.id_vehicle = id_vehicle;
    }

}