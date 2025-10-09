import {Payment} from "@/iam/domain/model/payment.entity.js";

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