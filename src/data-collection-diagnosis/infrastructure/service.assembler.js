import {Service} from "@/data-collection-diagnosis/domain/model/service.entity.js";

/**
 * Assembler for converting API resources to Services entities
 * @class
 */
export class ServiceAssembler {

    /**
     * Converts a plain resource object to a Service entities
     * @param {Object}resource - The resource object representing a services
     * @returns {Service} The corresponding Services entity
     */
    static toEntityFromResource(resource) {
        return new Service({...resource});
    }

    /**
     * Converts an API response to an array of Services entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     *
     * @param {import('axios').AxiosResponse} response - The API response containing service data.
     * @returns {Service[]} Array of Services entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['services'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }

}