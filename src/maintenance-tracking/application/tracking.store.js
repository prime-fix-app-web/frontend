import {TrackingApi} from "@/maintenance-tracking/infrastructure/tracking-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {NotificationAssembler} from "@/maintenance-tracking/infrastructure/notification-assembler.js";

const trackingApi = new TrackingApi();

const trackingStore = defineStore('tracking', () => {

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

    /**
     * Fetch all notifications from the API and update the store.
     */
    function fetchNotifications() {
        trackingApi.getNotifications().then(response => {
            notifications.value = NotificationAssembler.toEntitiesFromResponse(response);
            notificationsLoaded.value = true;
            console.log(notificationsLoaded.value);
            console.log(notifications.value);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Add a new notification via the API and update the store.
     * @param notification - The notification entity to add.
     * @returns {Promise<unknown>} - A promise that resolves to the added notification.
     */
    function addNotification(notification) {
        return new Promise((resolve, reject) => {
            const resource = NotificationAssembler.toResourceFromEntity(notification);
            trackingApi.createNotification(resource).then(response => {
                const responseData = response.data;
                const newNotification = NotificationAssembler.toEntityFromResource(responseData);
                notifications.value.push(newNotification);
                resolve(newNotification);
            }).catch(error => {
                errors.value.push(error);
                reject(error);
            });
        })
    }

    /**
     * Update an existing notification via the API and update the store.
     * @param notification - The notification entity to update.
     * @returns {Promise<unknown | void>} - A promise that resolves to the updated notification.
     */
    function updateNotification(notification) {
        return new Promise((resolve, reject) => {
          trackingApi.updateNotification(notification).then(response => {
              const resource = NotificationAssembler.toResourceFromEntity(response);
              const updatedNotification = NotificationAssembler.toEntityFromResource(resource);
              const index = notifications.value.findIndex(n => n.id === updatedNotification.id);
              if (index !== -1) notifications.value[index] = updatedNotification;
          })
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Delete a notification via the API and update the store.
     * @param {Notification} notification - The notification entity to delete.
     * @returns {Promise<unknown>} - A promise that resolves when the notification is deleted.
     */
    function deleteNotification(notification) {
        return new Promise((resolve, reject) => {
            trackingApi.deleteNotification(notification.id).then(() => {
                const index = notifications.value.findIndex(n => n.id === notification.id);
                if (index !== -1) notifications.value.splice(index, 1);
                resolve();
            }).catch(error => {
                errors.value.push(error);
                reject(error);
            });
        });
    }

    return {
        notifications,
        errors,
        notificationsLoaded,
        notificationsCount,
        fetchNotifications,
        addNotification,
        updateNotification,
        deleteNotification
    }
})