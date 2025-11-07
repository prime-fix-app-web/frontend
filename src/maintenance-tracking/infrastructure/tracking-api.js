import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

/**
 * Endpoint path for notifications.
 */
const notificationsEndpointPath = import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH;

/**
 * Endpoint path for vehicles
 */
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;

/**
 * Query parameter key for notification ID.
 * @type {string} - The query parameter key for notification ID.
 */
const notificationQueryParamKey = String(import.meta.env.VITE_NOTIFICATION_QUERY_PARAM_KEY).toLowerCase();

/**
 * Query parameter key for a vehicle ID
 */
const vehicleQueryParamKey = import.meta.env.VITE_VEHICLE_QUERY_PARAM_KEY;

/**
 * Flag to determine if query params should be used.
 * @type {boolean} - True if query params are to be used, false otherwise.
 */
const useQueryParams = String(import.meta.env.VITE_USE_PATH_PARAMS).toLowerCase() === 'true';

export class TrackingApi extends BaseApi {
    #notificationsEndpoint;
    #vehiclesEndpoint;

    constructor() {
        super();
        this.#notificationsEndpoint = new BaseEndpoint(this, notificationsEndpointPath,{
           usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
           idQueryParamKey: notificationQueryParamKey,
        });
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath, {
            usePathParams: import.meta.env.VITE_USE_PATH_PARAMS, // false en prod
            idQueryParamKey: import.meta.env.VITE_VEHICLE_QUERY_PARAM_KEY // "id_vehicle"
        });
    }

    /**
     * Get all notifications.
     * @returns {Promise<Notification[]>} - A promise that resolves to an array of notifications.
     */
    async getNotifications() {
        const res = await this.#notificationsEndpoint.getAll();
        return res?.data ?? res;
    }

    /**
     * Get a notification by its ID.
     * @param id - The ID of the notification to retrieve.
     * @returns {Promise<Notification>} - A promise that resolves to the notification.
     */
    async getNotificationById(id) {
        const res = await this.#notificationsEndpoint.getById(id);
        return res?.data ?? res;
    }

    /**
     * Create a new notification.
     * @param resource - The notification resource to create.
     * @returns {Promise<Notification>} - A promise that resolves to the created notification.
     */
    async createNotification(resource) {
        const res = await this.#notificationsEndpoint.create(resource);
        return res?.data ?? res;
    }

    /**
     * Update an existing notification.
     * @param input - The notification resource to update.
     * @returns {Promise<Notification>} - A promise that resolves to the updated notification.
     */
    async updateNotification(input) {
        const resource = input;

        const id =
            input?.id ??
            input?.id_notification ??
            resource?.id ??
            resource?.id_notification;

        if (id === undefined || id === null || id === '') {
            throw new Error("updateNotification: id required");
        }

        const res = await this.#notificationsEndpoint.update(id, resource);
        return res?.data ?? res;
    }

    /**
     * Delete a notification by its ID.
     * @param input - The ID of the notification to delete.
     * @returns {Promise<Notification>} - A promise that resolves to the deleted notification.
     */
    async deleteNotification(input) {
        const id = (typeof input === 'string' || typeof input === 'number')
            ? input
            : input?.id ?? input?.id_notification;

        if (id === undefined || id === null || id === '') {
            throw new Error("deleteNotification: id required");
        }
        const res = await this.#notificationsEndpoint.delete(id);
        return res?.data ?? res;
    }


    getVehicles(){
        return this.#vehiclesEndpoint.getAll();
    }

    getVehiclesById(id){
        return this.#vehiclesEndpoint.getById(id);
    }

    createVehicle(vehicle){
        return this.#vehiclesEndpoint.create(vehicle);
    }

    updateVehicle(id,vehicle){
        return this.#vehiclesEndpoint.update(id, vehicle);
    }

    deleteVehicle(id){
        return this.#vehiclesEndpoint.delete(id);
    }

}