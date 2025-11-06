import {TrackingApi} from "@/maintenance-tracking/infrastructure/tracking-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {NotificationAssembler} from "@/maintenance-tracking/infrastructure/notification-assembler.js";
import {VehicleAssembler} from "@/maintenance-tracking/infrastructure/vehicle.assembler.js";

const trackingApi = new TrackingApi();

const useTrackingStore = defineStore('tracking', () => {

    /**
     * List of notifications.
     * @type {import('vue').Ref<Notification[]>}
     */
    const notifications = ref([]);

    const vehicles = ref([]);

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
        loading.value = true;
        try {
            const response = await trackingApi.getNotifications();
            notifications.value = NotificationAssembler.toEntitiesFromResponse(response);
        } catch (err) {
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
            const created = await trackingApi.createNotification(resource);
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
        trackingApi.getVehicles().then((response) => {
            vehicles.value = VehicleAssembler.toEntitiesFromResponse(response);
            vehiclesLoaded.value = true;
        }).catch((err) => {
            pushError(err);
        })
    }

    function getVehiclesById(id) {
        return vehicles.value.find((vehicle) => vehicle.id_vehicle === id);
    }

    function addVehicle (vehicle){
        trackingApi.createVehicle(vehicle).then((response) => {
            const resource = response.data;
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
            const vehicleId = String(id).trim();

            const response = await trackingApi.updateVehicle(vehicleId, vehicleData);

            const index = vehicles.value.findIndex(v => v.id_vehicle === vehicleId);
            if (index !== -1) {
                vehicles.value[index] = {
                    ...vehicles.value[index],
                    ...vehicleData,
                    id_vehicle: vehicleId,
                };
            }

            loading.value = false;
            return response;
        } catch (error) {
            pushError(error);
            loading.value = false;
            throw error;
        }
    };

    const deleteVehicle = async (id_vehicle) => {
        if (!id_vehicle) {
            return;
        }
        trackingApi.deleteVehicle(id_vehicle).then(() => {
            const index = vehicles.value.findIndex(v => v.id_vehicle === id_vehicle);
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
    }
});

export default useTrackingStore;