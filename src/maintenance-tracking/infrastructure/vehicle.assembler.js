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