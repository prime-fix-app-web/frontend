import {ServiceOffer} from "@/auto-repair-catalog/domain/model/service-offer.entity.js";

/**
 * Assembler class to convert service offer data between different representations.
 */
export class ServiceOfferAssembler{

    /**
     * Converts a plain resource object into a ServiceOffer entity.
     *
     * @param {Object} resource - The resource object containing service offer data.
     * @returns {ServiceOffer} - A new ServiceOffer entity.
     */
    static toEntityFromResource(resource){
        return new ServiceOffer({...resource});
    }

    /**
     * Converts an HTTP response object into an array of ServiceOffer entities.
     *
     * @param {Object} response - The HTTP response object.
     * @param {number} response.status - The HTTP status code.
     * @param {string} response.statusText - The HTTP status text.
     * @param {Object|Array} response.data - The response payload, which can be an array or an object with "service-offer" key.
     * @returns {ServiceOffer[]} - Array of ServiceOffer entities, or empty array if status is not 200.
     */ 
    static toEntityFromResponse(response){
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`)
            return [];
        }
        
        let resources = response.data instanceof Array ? response.data :response.data ["service-offer"];
         return resources.map(resource => this.toEntityFromResource(resource));   
    }

    /**
     * Converts an array of resource objects into an array of ServiceOffer entities.
     *
     * @param {Object[]} resources - An array of resource objects.
     * @returns {ServiceOffer[]} - Array of ServiceOffer entities. Returns empty array if input is not an array.
     */
    static toDomainModelList(resources) {
        if (!Array.isArray(resources)) {
            return [];
        }
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}