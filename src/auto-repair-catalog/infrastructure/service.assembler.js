import {Service} from "@/auto-repair-catalog/domain/model/service.entity.js";

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
        console.log('[ServiceAssembler] toEntityFromResource input:', resource);
        const entity = new Service({...resource});
        console.log('[ServiceAssembler] toEntityFromResource output:', entity);
        return entity;
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
        console.log('[ServiceAssembler] toEntitiesFromResponse response:', response);
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['services'];
        console.log('[ServiceAssembler] toEntitiesFromResponse resources:', resources);

        const entities = resources.map(resource => this.toEntityFromResource(resource));
        console.log('[ServiceAssembler] toEntitiesFromResponse entities:', entities);
        return entities;
    }

}