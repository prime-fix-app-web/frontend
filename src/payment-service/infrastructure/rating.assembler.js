import {Rating} from "@/payment-service/domain/model/rating.entity.js";

/**
 * Assembler for converting rating resources to Rating entities.
 */
export class RatingAssembler {
    /**
     * Converts a resource object to a Rating entity.
     * @param resource - The resource object to convert.
     * @returns {Rating} - The resulting Rating entity.
     */
    static toEntityFromResource(resource) {
        return new Rating({ ...resource });
    }

    /**
     * Converts an array of resource objects to an array of Rating entities.
     * @param response - The API response containing payment data.
     * @returns {Rating[]} - An array of Rating entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['ratings'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}