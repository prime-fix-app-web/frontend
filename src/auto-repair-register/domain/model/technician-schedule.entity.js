/**
 * Represents a TechnicianSchedule entity
 * @class
 */
export class TechnicianSchedule {
    /**
     * Creates a new TechnicianSchedule instance
     * @param {Object} params - The parameters for the Technician Schedule.
     * @param {string}[id_schedule]
     * @param {string}[id_technician]
     * @param {string}[day_of_week]
     * @param {string}[start_time]
     * @param {string}[end_time]
     * @param {string}[is_active]
     */
    constructor({id_schedule='',id_technician='', day_of_week='', start_time='', end_time='', is_active='' }){
        this.id_schedule=id_schedule;
        this.id_technician=id_technician;
        this.day_of_week=day_of_week;
        this.start_time=start_time;
        this.end_time=end_time;
        this.is_active=is_active;
    }
}