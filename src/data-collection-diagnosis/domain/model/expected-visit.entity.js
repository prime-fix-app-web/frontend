/**
 * Represents a Expected Visit entity in the Data Collection Diagnosis Bounded Context.
 * @class
 */
export class ExpectedVisit {
    /**
     * Creates a new Expected Visit instance
     * @param {Object} params - The parameters for the Expected Visit.
     * @param {?number} [id] - The unique identifier of the expected visit.
     * @param {string} [state_visit] - The state of the visit.
     * @param {?number} [visit_id] - The identifier of the visit.
     * @param {boolean} [is_scheduled] - Indicates if the visit is scheduled.
     */
    constructor({id =null,state_visit='', visit_id=null, is_scheduled=false}){
        this.id = id;
        this.state_visit=state_visit;
        this.visit_id=visit_id;
        this.is_scheduled=is_scheduled;
    }
}