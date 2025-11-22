/**
 * Represents a Expected Visit entity
 * @class
 */
export class ExpectedVisit {
    /**
     * Creates a new Expected Visit instance
     * @param {Object} params - The parameters for the Expected Visit.
     * @param id_expected
     * @param state_visit
     * @param id_visit
     * @param is_schedule
     */
    constructor({id_expected='',state_visit='', id_visit='', is_schedule=false}){
        this.id_expected=id_expected;
        this.state_visit=state_visit;
        this.id_visit=id_visit;
        this.is_schedule=is_schedule;
    }
}