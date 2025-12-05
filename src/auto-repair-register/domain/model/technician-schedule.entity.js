/**
 * Represents a Technician Schedule entity in the Auto Repair Register Bounded Context.
 * @class
 */
export class TechnicianSchedule {
    /**
     * Creates a new TechnicianSchedule instance
     * @param {Object} params - The parameters for the Technician Schedule.
     * @param {?number}[id] - The unique identifier for the schedule.
     * @param {?number}[technician_id] - The unique identifier for the technician.
     * @param {string}[day_of_week] - The day of the week for the schedule.
     * @param {string}[start_time] - The start time for the schedule.
     * @param {string}[end_time] - The end time for the schedule.
     * @param {boolean}[is_active] - The active status of the schedule.
     */
    constructor({id=null,technician_id=null, day_of_week='', start_time='', end_time='', is_active=false }){
        this.id = id;
        this.technician_id=technician_id;
        this.day_of_week=day_of_week;
        this.start_time=start_time;
        this.end_time=end_time;
        this.is_active=is_active;
    }
}