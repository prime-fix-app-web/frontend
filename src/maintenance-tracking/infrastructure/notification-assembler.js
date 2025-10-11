import { Notification } from "@/maintenance-tracking/domain/model/notification.entity.js";

/**
 * Assembler for converting between Notification entities and resources.
 * @class
 */
export class NotificationAssembler {

    /**
     * Converts a resource object to a Notification entity.
     * @param resource - The resource object to convert.
     * @returns {Notification} - The resulting Notification entity.
     */
    static toEntityFromResource(resource) {
        return new Notification({ ...resource });
    }

    /**
     * Converts a Notification entity to a resource object for API requests.
     * @param entity - The Notification entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id_notification: entity.id,
            message: entity.message,
            read: entity.read,
            id_vehicle: entity.id_vehicle,
            sent: entity.sent
        };
    }

    /**
     * Converts an array of resource objects to an array of Notification entities.
     * @param {import('axios').AxiosReponse} response - The API response containing notification data
     * @returns {Notification[]} - An array of Notification entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['notifications'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}