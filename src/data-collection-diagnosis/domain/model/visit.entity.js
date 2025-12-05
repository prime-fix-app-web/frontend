/**
 * Represents a Visit entity
 * @class
 */
export class Visit {
    /**
     * Creates a new Visit instance
     * @param {Object} params - The parameters for the visit.
     * @param {?number} [params.id=null] - The unique identifier for the visit
     * @param {string} [params.failure='']  - The failure of the vehicle
     * @param {string}[params.time_visit=''] - The time of the visit scheduled
     * @param {?number}[params.vehicle_id=null] - The unique identifier for the vehicle
     * @param {?number}[params.auto_repair_id=null] - The unique identifier for the auto-repair
     * @param {?number}[params.service_id=null] - The unique identifier for the service
     */
    constructor({id = null, failure='',time_visit= '', vehicle_id= null, auto_repair_id=null,
                    service_id=null}){
        this.id = id;
        this.failure = failure;
        this.time_visit = time_visit;
        this.auto_repair_id = auto_repair_id;
        this.vehicle_id = vehicle_id;
        this.service_id = service_id;
    }

}