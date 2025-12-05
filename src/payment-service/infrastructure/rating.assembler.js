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
     * Converts a Rating entity to a resource object for API requests.
     * @param {Rating} entity - The Rating entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            star_rating: entity.star_rating,
            comment: entity.comment,
            time_rating: entity.time_rating,
            auto_repair_id: entity.auto_repair_id,
            user_account_id: entity.user_account_id
        };
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