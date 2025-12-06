import {Technician} from "@/auto-repair-register/domain/model/technician.entity.js";

/**
 * Assembler for converting Technician resources to Technician entities.
 */
export class TechnicianAssembler {
    /**
     * Converts a Technician resource to a Technician entity.
     * @param resource - The Technician resource object.
     * @returns {Technician} - The corresponding Technician entity.
     */
    static toEntityFromResource(resource) {
        return new Technician({...resource});
    }

    /**
     * Converts a Technician entity to a resource object for API requests.
     * @param {Technician} entity - The Technician entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        return {
            name: entity.name,
            last_name: entity.last_name,
            auto_repair_id: entity.auto_repair_id
        };
    }

    /**
     * Converts a response containing multiple Technician resources to an array of Technician entities.
     * @param response - The response object containing Technician resources.
     * @returns {Technician[]} - An array of Technician entities.
     */
    static toEntitiesFromResponse(response){
        if(response.status !==200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["technicians"];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}