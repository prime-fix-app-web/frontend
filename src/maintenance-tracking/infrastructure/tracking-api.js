import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

// Environment variables for endpoint paths
const notificationsEndpointPath = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH;

// Query param keys from environment
const notificationQueryParamKey = import.meta.env.VITE_NOTIFICATION_QUERY_PARAM_KEY;

export class TrackingApi extends BaseApi {
    #notificationsEndpoint;

    constructor() {
        super();
        this.#notificationsEndpoint = new BaseEndpoint(this, notificationsEndpointPath,
            {  usePathParams: import.meta.env.VITE_USE_PATH_PARAMS, idQueryParamKey: notificationQueryParamKey });
    }

    /**
     * Get all notifications.
     * @returns {Promise} - A promise that resolves to the list of notifications.
     */
    getNotifications() {
        return this.#notificationsEndpoint.getAll();
    }

    /**
     * Get a notification by its ID.
     * @param id - The ID of the notification.
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the notification.
     */
    getNotificationById(id) {
        return this.#notificationsEndpoint.getById(id);
    }

    /**
     * Create a new notification.
     * @param resource - The notification resource to create.
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the created notification.
     */
    createNotification(resource) {
        return this.#notificationsEndpoint.create(resource);
    }

    /**
     * Update an existing notification.
     * @param resource - The notification resource to update.
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the updated notification.
     */
    updateNotification(resource) {
        return this.#notificationsEndpoint.update(resource.id, resource);
    }

    /**
     * Delete a notification by its ID.
     * @param id - The ID of the notification to delete.
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the deletion result.
     */
    deleteNotification(id) {
        return this.#notificationsEndpoint.delete(id);
    }
}