import {Visit} from "@/data-collection-diagnosis/domain/model/visit.entity.js";

/**
 * Assembler for converting API resources to Visit entities
 */
export class VisitAssembler{

    /**
     * Converts a plain resource object to a Visit entity
     * @param {Object} resource - The resource object representing a visit
     * @returns {Visit} The corresponding Visit entity
     */
    static toEntityFromResource(resource){
        return new Visit({...resource});
    }

    /**
     * Converts an API response to an array of Visit entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     * @param {import('axios').AxiosResponse} response - The API response containing visit data
     * @returns {Visit[]} Array of Visit entities
     */
    static toEntitiesFromResponse(response){
        if(response.status !== 200){
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['visits'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}