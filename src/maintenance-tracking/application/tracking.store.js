import {TrackingApi} from "@/maintenance-tracking/infrastructure/tracking-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {NotificationAssembler} from "@/maintenance-tracking/infrastructure/notification-assembler.js";

const trackingApi = new TrackingApi();

const useTrackingStore = defineStore('tracking', () => {

    /**
     * List of notifications.
     * @type {import('vue').Ref<Notification[]>}
     */
    const notifications = ref([]);

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

    /**
     * Count of notifications.
     * @type {import('vue').ComputedRef<number>}
     */
    const notificationsCount = computed(() =>{
        return notificationsLoaded ? notifications.value.length : 0;
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

    const pushError = (err) => {
      const e = err?.response?.data ?? err?.message ?? String(err);
        errors.value.push(e);
    };

    return {
        notifications,
        errors,
        notificationsLoaded,
        loading,
        notificationsCount,
        fetchNotifications,
        addNotification,
        updateNotification,
        deleteNotification
    }
});

export default useTrackingStore;