/**
 * Represents a Visit entity
 * @class
 */
export class Visit {
    /**
     * Creates a new Visit instance
     * @param {Object} params - The parameters for the visit.
     * @param {string} [params.id_visit=''] - The unique identifier for the visit
     * @param {string} [params.failure='']  - The failure of the vehicle
     * @param {string}[params.id_vehicle=''] - The unique identifier for the vehicle
     * @param {string}[params.id_auto_repair=''] - The unique identifier for the auto-repair
     * @param {string}[params.id_service=''] - The unique identifier for the service
     * @param {string}[params.time_visit=''] - The time of the visit scheduled
     */
    constructor({id_visit = '', failure='',id_vehicle= '',time_visit= '', id_auto_repair='',
                    id_service=''}){
        this.id_visit = id_visit;
        this.failure = failure;
        this.id_vehicle = id_vehicle;
        this.id_auto_repair = id_auto_repair;
        this.time_visit = time_visit;
        this.id_service = id_service;

    }

}