import {Vehicle} from "@/maintenance-tracking/domain/model/vehicle.entity.js";

/**
 * Assembler for converting rating resources to Rating entities.
 */
export class VehicleAssembler {
    /**
     * Converts a resource object to a Vehicle entity.
     * @param resource - The resource object to convert.
     * @returns {Vehicle} - The resulting Vehicle entity.
     */
    static toEntityFromResource(resource) {
        return new Vehicle({ ...resource });
    }

    /**
     * Converts a Vehicle entity to a resource object for API requests.
     * @param {Vehicle} entity - The Vehicle entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        return {
            color: entity.color,
            model: entity.model,
            user_id: entity.user_id,
            vehicle_brand: entity.vehicle_brand,
            vehicle_plate: entity.vehicle_plate,
            vehicle_type: entity.vehicle_type,
            maintenance_status: entity.maintenance_status
        };
    }

    /**
     * Converts an array of resource objects to an array of Vehicle entities.
     * @param response - The API response containing payment data.
     * @returns {Vehicle[]} - An array of Vehicle entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['vehicles'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}