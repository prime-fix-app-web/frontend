import { Notification } from "@/maintenance-tracking/domain/model/notification.entity.js";

/**
 * Assembler for converting between Notification entities and resources.
 * @class
 */
export class NotificationAssembler {


    /**
     * Extracts notification resources from various input formats.
     * @param input - The input which may contain notification data.
     * @returns {Array} - An array of notification resources.
     */
    static #extractResources(input) {
        const data = (input && typeof input === "object" && "data" in input) ? input.data : input;

        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.notifications)) return data.notifications;

        return Array.isArray(data?.items) ? data.items : [];
    }

    /**
     * Converts a resource object to a Notification entity.
     * @param resource - The resource object to convert.
     * @returns {Notification} - The resulting Notification entity.
     */
    static toEntityFromResource(resource) {
        return new Notification({
            id_notification: resource.id_notification,
            message: resource.message,
            read: resource.read,
            id_vehicle: resource.id_vehicle,
            sent: resource.sent,
        });
    }

    /**
     * Converts a Notification entity to a resource object.
     * @param entity - The Notification entity to convert.
     * @returns {{id_notification, message, read: boolean, id_vehicle, sent}|null} - The resulting resource object.
     */
    static toResourceFromEntity(entity) {
        return {
            id_notification: entity.id_notification,
            message: entity.message,
            read: !!entity.read,
            id_vehicle: entity.id_vehicle,
            sent: entity.sent
        };
    }

    /**
     * Converts an API response to an array of Notification entities.
     * @param response - The API response containing notification data.
     * @returns {Notification[]} - An array of Notification entities.
     */
    static toEntitiesFromResponse(response) {
        const resources = this.#extractResources(response);
        return resources.map((r) => this.toEntityFromResource(r)).filter(Boolean);
    }
}