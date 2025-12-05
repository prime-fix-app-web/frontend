import {Location} from "@/auto-repair-catalog/domain/model/location.entity.js";

/**
 * Assembler for converting API to Locations entities
 * @class
 */
export class LocationAssembler{

    /**
     * Converts a plain resource object to a Location entities
     * @param {Object} resource - The resource object representing a services
     * @returns {Location} - The corresponding Services entity
     */
    static toEntityFromResource(resource){
        return new Location({...resource});
    }

    /**
     * Converts an API response to an array of Locations entities
     * Handles both array and object response formats
     * Logs an error and return an empty array if the response status is not 200
     * @param {import('axios').AxiosResponse} response - The API response containing service data.
     * @returns {Location[]} - Array of Locations entities.
     */
    static toEntitiesFromResponse(response){
        if(response.status !==200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array? response.data : response.data['locations'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}