import {Visit} from "@/payment-service/domain/model/visit.entity.js";

/**
 * Assembler for converting payment resources to Visit entities.
 */
export class VisitAssembler {
    /**
     * Converts a resource object to a Visit entity.
     * @param resource - The resource object to convert.
     * @returns {Visit} - The resulting Visit entity.
     */
    static toEntityFromResource(resource) {
        return new Visit({ ...resource });
    }

    /**
     * Converts an array of resource objects to an array of Visit entities.
     * @param response - The API response containing payment data.
     * @returns {Visit[]} - An array of Visit entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['visits'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}