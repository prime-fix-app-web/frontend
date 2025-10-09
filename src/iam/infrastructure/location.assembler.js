import { Location } from '@/iam/domain/model/location.entity.js'

/**
 * Assembler for converting location resources to Location entities.
 * @class
 */
export class LocationAssembler {
    /**
     * Converts a resource object to a Location entity.
     * @param resource - The resource object to convert.
     * @returns {Location} - The resulting Location entity.
     */
    static toEntityFromResource(resource) {
        return new Location({...resource})
    }

    /**
     * Converts an array of resource objects to an array of Location entities.
     * Handles both arrays and response formats.
     * Logs an error and returns an empty array if response status is not 200.
     * @param {import('axios').AxiosReponse} response - The API response containing location data
     * @returns {Location[]} - An array of Location entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['locations'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}