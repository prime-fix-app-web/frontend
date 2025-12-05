import {Payment} from "@/payment-service/domain/model/payment.entity.js";

/**
 * Assembler for converting payment resources to Payment entities.
 */
export class PaymentAssembler {
    /**
     * Converts a resource object to a Payment entity.
     * @param resource - The resource object to convert.
     * @returns {Payment} - The resulting Payment entity.
     */
    static toEntityFromResource(resource) {
        return new Payment({ ...resource });
    }

    /**
     * Converts a Payment entity to a resource object for API requests.
     * @param {Payment} entity - The Payment entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            card_number: entity.card_number,
            card_type: entity.card_type,
            month: entity.month,
            year: entity.year,
            cvv: entity.cvv,
            user_account_id: entity.user_account_id
        };
    }

    /**
     * Converts an array of resource objects to an array of Payment entities.
     * @param response - The API response containing payment data.
     * @returns {Payment[]} - An array of Payment entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['payments'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}