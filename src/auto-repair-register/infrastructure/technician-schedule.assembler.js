import {TechnicianSchedule} from "@/auto-repair-register/domain/model/technician-schedule.entity.js";

/**
 * Assembler for converting Technician Schedule resources to Technician Schedule entities.
 */
export class TechnicianScheduleAssembler {
    /**
     * Converts a Technician Schedule resource to a Technician Schedule entity.
     * @param resource - The Technician Schedule resource object.
     * @returns {TechnicianSchedule} - The corresponding Technician Schedule entity.
     */
    static toEntityFromResource(resource){
        return new TechnicianSchedule({...resource});
    }

    /**
     * Converts a Technician Schedule entity to a resource object for API requests.
     * @param {TechnicianSchedule} entity - The Technician Schedule entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        const resource = {
            technician_id: entity.technician_id,
            day_of_week: entity.day_of_week,
            start_time: entity.start_time,
            end_time: entity.end_time,
            is_active: entity.is_active
        };

        // Solo incluir id si existe y NO es temporal (no comienza con 'TS')
        if (entity.id && typeof entity.id === 'number') {
            resource.id = entity.id;
        }

        return resource;
    }

    /**
     * Converts a response containing multiple Technician Schedule resources to an array of Technician Schedule entities.
     * @param response - The response object containing Technician Schedule resources.
     * @returns {TechnicianSchedule[]} - An array of Technician Schedule entities.
     */
    static toEntitiesFromResponse(response){
        if(response.status !== 200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        let resources = response.data instanceof Array ?response.data: response.data["technician_schedules"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}