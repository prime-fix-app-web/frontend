import {Vehicle} from "@/data-collection-diagnosis/domain/model/vehicle.entity.js";


/**
 * Assembler for converting API resources to Vehicle entities
 * @class
 */
export class VehicleAssembler {
    /**
     * Converts a plain resource object to a Vehicle entity
     * @param {Object}resource The resource object representing a vehicle.
     * @returns {Vehicle} The corresponding Vehicle entity.
     */
    static toEntityFromResource(resource) {
        return new Vehicle({...resource});
    }
    /**
     * Converts an API response to an array of Vehicle entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     *
     * @param {import('axios').AxiosResponse} response - The API response containing tutorial data.
     * @returns {Vehicle[]} Array of Vehicle entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['registered_vehicles'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

}