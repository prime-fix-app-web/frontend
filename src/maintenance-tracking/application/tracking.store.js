import {TrackingApi} from "@/maintenance-tracking/infrastructure/tracking-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {NotificationAssembler} from "@/maintenance-tracking/infrastructure/notification-assembler.js";
import {VehicleAssembler} from "@/maintenance-tracking/infrastructure/vehicle.assembler.js";
import {apiConfig} from "@/shared/infrastructure/http/api-config.js";

const trackingApi = new TrackingApi();

/**
 * Check if there is an active JWT token in storage
 * @returns {boolean}
 */
function hasActiveJWT() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
}

const useTrackingStore = defineStore('tracking', () => {

    /**
     * List of notifications.
     * @type {import('vue').Ref<Notification[]>}
     */
    const notifications = ref([]);

    const vehicles = ref([]);

    const visits = ref([]);

    /**
     * List of errors.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Indicates if notifications have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const notificationsLoaded = ref(false);

    const vehiclesLoaded = ref(false);
    /**
     * Count of notifications.
     * @type {import('vue').ComputedRef<number>}
     */
    const notificationsCount = computed(() =>{
        return notificationsLoaded ? notifications.value.length : 0;
    })

    const vehiclesCount = computed(() =>{
        return vehiclesLoaded ? vehicles.value.length : 0;
    })

    const loading = ref(false);

    /**
     * Fetch notifications from the API and update the store.
     * @returns {Promise<void>} - A promise that resolves when notifications are fetched.
     */
    async function fetchNotifications() {
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[Tracking Store] Skipping fetchNotifications - No JWT token available');
            notificationsLoaded.value = true;
            return Promise.resolve();
        }

        loading.value = true;
        try {
            const response = await trackingApi.getNotifications();
            notifications.value = NotificationAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('[Tracking Store] fetchNotifications error:', err);
            pushError(err);
        } finally {
            notificationsLoaded.value = true;
            loading.value = false;
        }
    }

    /**
     * Add a new notification via the API and update the store.
     * @param notification - The notification entity to add.
     * @returns {Promise<Notification>} - A promise that resolves to the added notification.
     */
    async function addNotification(notification) {
        try {
            const resource = NotificationAssembler.toResourceFromEntity(notification);
            const response = await trackingApi.createNotification(resource);

            // Handle both AWS (single object) and Supabase (array) responses
            let created = response.data;

            // If response is an array (Supabase), get the first element
            if (Array.isArray(created)) {
                created = created[0];
            }

            const entity = NotificationAssembler.toEntityFromResource(created);
            notifications.value.push(entity);
            return entity;
        } catch (err) {
            pushError(err);
            return Promise.reject(err);
        }
    }

    /**
     * Update an existing notification via the API and update the store.
     * @param notification - The notification entity to update.
     * @returns {Promise<Notification>} - A promise that resolves to the updated notification.
     */
    async function updateNotification(notification) {
        try {
            const resource = NotificationAssembler.toResourceFromEntity(notification);
            await trackingApi.updateNotification(resource);

            const updatedRes = await trackingApi.updateNotification(resource);

            const updated = NotificationAssembler.toEntityFromResource(updatedRes);

            const idx = notifications.value.findIndex((n) => n.id === updated.id);

            if (idx !== -1) notifications.value[idx] = updated;
            return updated;
        } catch (err) {
            pushError(err);
            return Promise.reject(err);
        }
    }

    /**
     * Delete a notification via the API and update the store.
     * @param notification - The notification entity to delete.
     * @returns {Promise<never>} - A promise that resolves when the notification is deleted.
     */
    async function deleteNotification(notification) {
        try {
            await trackingApi.deleteNotification(notification.id);
            const idx = notifications.value.findIndex((n) => n.id === notification.id);
            if (idx !== -1) notifications.value.splice(idx, 1);
        } catch (err) {
            pushError(err);
            return Promise.reject(err);
        }
    }

    function fetchVehicles(){
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[Tracking Store] Skipping fetchVehicles - No JWT token available');
            return Promise.resolve();
        }

        return trackingApi.getVehicles().then((response) => {
            vehicles.value = VehicleAssembler.toEntitiesFromResponse(response);
            vehiclesLoaded.value = true;
        }).catch((err) => {
            console.error('[Tracking Store] fetchVehicles error:', err);
            pushError(err);
        });
    }

    function getVehiclesById(id) {
        return vehicles.value.find((vehicle) => vehicle.id === id);
    }

    /**
     * Get all visits for a specific vehicle
     * @param {number|string} vehicleId - The ID of the vehicle
     * @returns {Array} - Array of visits for the vehicle
     */
    function visitsByVehicle(vehicleId) {
        return visits.value.filter((visit) => visit.vehicle_id === vehicleId);
    }

    function addVehicle (vehicle){
        trackingApi.createVehicle(vehicle).then((response) => {
            // Handle both AWS (single object) and Supabase (array) responses
            let resource = response.data;

            // If response is an array (Supabase), get the first element
            if (Array.isArray(resource)) {
                resource = resource[0];
            }

            const newVehicle = VehicleAssembler.toEntityFromResource(resource);
            vehicles.value.push(newVehicle);
        }).catch((err) => {
            pushError(err);
        })
    }

    const updateVehicle = async (id, vehicleData) => {
        loading.value = true;
        errors.value = [];
        try {
            const vehicleId = id;

            console.log('[Tracking Store] updateVehicle called with:', { id, vehicleData });

            // Use assembler to convert entity to resource if vehicleData is an entity
            const resource = vehicleData.constructor.name === 'Vehicle'
                ? VehicleAssembler.toResourceFromEntity(vehicleData)
                : vehicleData;

            console.log('[Tracking Store] Payload to send:', resource);
            console.log('[Tracking Store] Vehicle ID:', vehicleId);

            const response = await trackingApi.updateVehicle(vehicleId, resource);
            console.log('[Tracking Store] Update response:', response);

            // Update the vehicle in the store with the response data
            const index = vehicles.value.findIndex(v => String(v.id) === String(vehicleId));
            if (index !== -1) {
                // Use the response data or fall back to merging with existing
                const updatedData = response.data || resource;
                vehicles.value[index] = VehicleAssembler.toEntityFromResource({
                    ...vehicles.value[index],
                    ...updatedData,
                    id: vehicleId,
                });
            }

            loading.value = false;
            return response;
        } catch (error) {
            console.error('[Tracking Store] updateVehicle error:', error);
            pushError(error);
            loading.value = false;
            throw error;
        }
    };

    const deleteVehicle = async (vehicleId) => {
        if (!vehicleId) {
            return;
        }
        trackingApi.deleteVehicle(vehicleId).then(() => {
            const index = vehicles.value.findIndex(v => v.id === vehicleId);
            if (index !== -1) vehicles.value.splice(index, 1);
        }).catch((err) => {
            errors.value.push(err);
        })
    };

    const pushError = (err) => {
      const e = err?.response?.data ?? err?.message ?? String(err);
        errors.value.push(e);
    };



    return {
        notifications,
        vehicles,
        visits,
        errors,
        notificationsLoaded,
        vehiclesLoaded,
        loading,
        notificationsCount,
        vehiclesCount,
        fetchNotifications,
        addNotification,
        updateNotification,
        deleteNotification,
        fetchVehicles,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehiclesById,
        visitsByVehicle,
    }
});

export default useTrackingStore;