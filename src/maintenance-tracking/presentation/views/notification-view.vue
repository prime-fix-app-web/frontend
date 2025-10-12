<script setup>
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref, watch} from "vue";
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";
import {storeToRefs} from "pinia";

const { t } = useI18n();
const store = useTrackingStore();
const {
  notifications,
  notificationsLoaded,
  errors,
  notificationsCount,
  loading,
} = storeToRefs(store);

const {
  fetchNotifications,
  updateNotification,
} = store;

/**
 * Flag to indicate if it's the first mount of the component
 * @type {import("vue").Ref<boolean>}
 */
const firstMount = ref(false);


/**
 * Computed property to determine if the UI should show a loading state
 * @type {import("vue").ComputedRef<boolean>}
 */
const uiLoading = computed(() => loading.value && firstMount.value);

/**
 * Error message to display to the user
 * @type {import("vue").Ref<string>}
 */
const displayError = ref('');

/**
 * Operation loading state to manage loading indicators for actions
 * @type {import('vue').Ref<boolean>}
 */
const operationLoading = ref(false); // Local loading state for operations

/**
 * Initial loading state to manage the first load of notifications
 * @type {import('vue').Ref<number>}
 */
const unreadCount = computed(() => unreadNotifications.value.length);

/**
 * Flag to indicate if the initial loading is in progress
 * @type {import('vue').ComputedRef<Notification[]>} - Array of unread notifications
 */
const unreadNotifications = computed(() =>
  (notifications.value || []).filter((n) => n.read === false)
);

/**
 * Computed property to get read notifications
 * @type {import('vue').ComputedRef<Notification[]>} - Array of read notifications
 */
const readNotifications = computed(() =>
    (notifications.value || []).filter((n) => n.read === true)
);

/**
 * Flag to indicate if the initial loading is in progress
 * @type {import("vue").Ref<boolean>}
 */
const hasNotifications = computed(
    () => (notificationsCount.value || 0) > 0
);

/**
 * Clear errors in the store
 */
const clearErrors = () => {
  errors.value = [];
};


/**
 * Flag to indicate if the initial loading is in progress
 */
onMounted(async () => {
  try {
    await fetchNotifications();
  } catch (error) {
    console.error("❌ Failed to load notifications:", error);
    displayError.value = "Error to load notifications";
  } finally {
    firstMount.value = false;
  }
});

/**
 * Watch for changes in errors from the store and update displayError accordingly
 * @param notification - The notification to mark as read
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
async function handleMarkAsRead(notification) {
  try {
    operationLoading.value = true;
    notification.read = true;
    await updateNotification(notification);
  } catch (error) {
    notification.read = false;
    displayError.value = "Error at marking as read";
    console.error("Failed to mark as read:", error);
  } finally {
    operationLoading.value = false;
  }
}

/**
 * Function to mark a notification as unread
 * @param notification - The notification to mark as unread
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
async function handleMarkAsUnread(notification) {
  try {
    operationLoading.value = true;
    notification.read = false;
    await updateNotification(notification);
  } catch (error) {
    notification.read = true;
    displayError.value = "Error at marking as unread";
    console.error("Failed to mark as unread:", error);
  } finally {
    operationLoading.value = false;
  }
}

/**
 * Function to mark all notifications as read
 * @returns {Promise<void>} - A promise that resolves when the operation is complete
 */
async function handleMarkAllAsRead() {
  try {
    operationLoading.value = true;
    for (const n of notifications.value) {
      if (!n.read) {
        n.read = true;
        await updateNotification(n);
      }
    }
  } catch (error) {
    console.error("Failed to mark as read:", error);
    displayError.value = "Error at marking all as read";
  } finally {
    operationLoading.value = false;
  }
}

  /**
   * Function to retry fetching notifications
   * @returns {Promise<void>} - A promise that resolves when the operation is complete
   */
  async function handleRetry() {
  displayError.value = "";
  clearErrors();
  firstMount.value = true;

  try {
    await fetchNotifications();
  } catch (error) {
    console.error("❌ Retry failed:", error);
    displayError.value = "Error to load notifications";
  } finally {
    firstMount.value = false;
  }
}

/**
 * Format date to a human-readable relative time
 * @param date - The date to format
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
  if (!date) return t('notification-view.no-date');

  const now = new Date();
  const notificationDate = new Date(date);
  const diffInMs = now.getTime() - notificationDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (t('notification-view.ago') === 'ago') {
    // If translation is not set, default to English format
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } else {
    // Spanish format
    if (diffInMinutes < 1) return 'Justo ahora';
    if (diffInMinutes < 60) return `${diffInMinutes} min ${$t('notification-view.ago')}`;
    if (diffInHours < 24) return `${diffInHours}h ${$t('notification-view.ago')}`;
    if (diffInDays < 7) return `${diffInDays}d ${$t('notification-view.ago')}`;
  }

  return notificationDate.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

/**
 * Dismiss the current error message
 */
function dismissError() {
  displayError.value = "";
  clearErrors();
}
</script>

<template>
  <div class="notification-view-container">
    <div class="notification-content">
      <!-- Header -->
      <div class="notification-header">
        <h1 class="notification-title">{{ t('notification-view.title') }}</h1>
        <button
            v-if="unreadCount > 0 && !uiLoading"
            class="mark-all-read-btn"
            @click="handleMarkAllAsRead"
            :disabled="operationLoading || loading"
            type="button"
        >
          {{ t('notification-view.markAllAsRead') }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="displayError" class="error-banner">
        <div class="error-content">
          <svg class="error-icon-small">
            <use href="/assets/icons/sprite.symbol.svg#alert"></use>
          </svg>
          <span class="error-text">{{ displayError }}</span>
          <button class="dismiss-error-btn" @click="dismissError" type="button">
            ✕
          </button>
        </div>
      </div>

      <!-- Initial Loading State -->
      <div v-if="uiLoading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ t('notification-view.loadingNotifications') }}</p>
      </div>

      <!-- Error State (only shown after initial load fails) -->
      <div v-else-if="!notificationsLoaded && !hasNotifications && displayError" class="error-state">
        <svg class="error-icon">
          <use href="/assets/icons/sprite.symbol.svg#bell"></use>
        </svg>
        <p class="error-message">{{ t('notification-view.errorMessage') }}</p>
        <p class="error-hint">{{ t('notification-view.errorRefresh') }}</p>
        <button class="retry-btn" @click="handleRetry" type="button">
          {{ t('notification-view.retry') }}
        </button>
      </div>

      <!-- Notifications Content -->
      <div v-else-if="notificationsLoaded || hasNotifications">
        <!-- Unread Notifications Section -->
        <div v-if="unreadNotifications.length > 0" class="notifications-section">
          <h2 class="section-title">
            {{ t('notification-view.nonRead') }}
            <span class="badge">{{ unreadCount }}</span>
          </h2>
          <div class="notifications-list">
            <div
                v-for="notification in unreadNotifications"
                :key="notification.id"
                class="notification-card unread"
                @click="handleMarkAsRead(notification)"
            >
              <div class="notification-indicator"></div>
              <div class="notification-body">
                <div class="notification-icon">
                  <svg>
                    <use href="/assets/icons/sprite.symbol.svg#bell"></use>
                  </svg>
                </div>
                <div class="notification-content-text">
                  <p class="notification-message">{{ notification.message }}</p>
                  <div class="notification-meta">
                    <span class="notification-time">{{ formatDate(notification.sent) }}</span>
                    <span class="notification-vehicle">{{ t('notification-view.vehicle') }} {{ notification.id_vehicle }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Read Notifications Section -->
        <div v-if="readNotifications.length > 0" class="notifications-section">
          <h2 class="section-title">{{ t('notification-view.read') }}</h2>
          <div class="notifications-list">
            <div
                v-for="notification in readNotifications"
                :key="notification.id"
                class="notification-card read"
                @click="handleMarkAsUnread(notification)"
            >
              <div class="notification-body">
                <div class="notification-icon">
                  <svg>
                    <use href="/assets/icons/sprite.symbol.svg#bell"></use>
                  </svg>
                </div>
                <div class="notification-content-text">
                  <p class="notification-message">{{ notification.message }}</p>
                  <div class="notification-meta">
                    <span class="notification-time">{{ formatDate(notification.sent) }}</span>
                    <span class="notification-vehicle">{{ t('notification-view.vehicle') }} {{ notification.id_vehicle }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!hasNotifications" class="empty-state">
          <svg class="empty-icon">
            <use href="/assets/icons/sprite.symbol.svg#bell"></use>
          </svg>
          <h3>{{ t('notification-view.noNotifications') }}</h3>
          <p>{{ t('notification-view.noNotificationsMessage') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-view-container {
  padding: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--color-second-complementary);
}

.notification-content {
  background: var(--color-light);
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-height: 70vh;
}

/* Header */
.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 3px solid var(--color-primary);
}

.notification-title {
  font-family: var(--font-bold);
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 0;
}

.mark-all-read-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--color-first-complementary);
  color: var(--color-dark);
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.mark-all-read-btn:hover {
  background: #ffb700;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

/* Section Titles */
.notifications-section {
  margin-bottom: 2rem;
}

.section-title {
  font-family: var(--font-bold);
  font-size: 1.3rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge {
  background: var(--color-first-complementary);
  color: var(--color-dark);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-family: var(--font-bold);
  min-width: 20px;
  text-align: center;
}

/* States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(17, 67, 88, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.loading-state p, .error-state p, .empty-state p {
  font-family: var(--font-medium);
  font-size: 1.1rem;
  color: var(--color-primary);
}

.error-icon, .empty-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.error-icon { color: #e74c3c; }
.empty-icon { color: var(--color-primary); }

/* Error Banner */
.error-banner {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1px solid #f87171;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon-small {
  width: 20px;
  height: 20px;
  color: #dc2626;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
  font-family: var(--font-medium);
  color: #7f1d1d;
  font-size: 0.9rem;
}

.dismiss-error-btn {
  background: none;
  border: none;
  color: #7f1d1d;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.dismiss-error-btn:hover {
  background: rgba(127, 29, 29, 0.1);
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  background: var(--color-primary);
  color: var(--color-light);
  font-family: var(--font-semibold);
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--color-primary);
  transform: translateY(-2px);
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  z-index: 10;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--color-light);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(17, 67, 88, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-content span {
  font-family: var(--font-medium);
  color: var(--color-primary);
  font-size: 0.9rem;
}

/* Notifications List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-card {
  background: var(--color-light);
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.notification-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.notification-card.unread {
  border-left: 5px solid var(--color-first-complementary);
  background: linear-gradient(135deg, rgba(242, 170, 31, 0.05) 0%, var(--color-light) 100%);
}

.notification-card.read {
  border-left: 5px solid #95a5a6;
  opacity: 0.8;
}

.notification-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 12px;
  height: 12px;
  background: var(--color-first-complementary);
  border-radius: 50%;
  border: 2px solid var(--color-light);
}

.notification-card.read .notification-badge { display: none; }

.notification-content-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.notification-info { flex: 1; }

.notification-type {
  font-family: var(--font-bold);
  font-size: 1.1rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notification-message {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.notification-date {
  font-family: var(--font-medium);
  font-size: 0.9rem;
  color: #6c757d;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  flex-shrink: 0;
}

.read-toggle-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-primary);
  border-radius: 6px;
  background: transparent;
  color: var(--color-primary);
  font-family: var(--font-medium);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.read-toggle-btn:hover {
  background: var(--color-primary);
  color: var(--color-light);
}

.read-toggle-btn.mark-unread {
  border-color: var(--color-first-complementary);
  color: var(--color-first-complementary);
}

.read-toggle-btn.mark-unread:hover {
  background: var(--color-first-complementary);
  color: var(--color-dark);
}

/* Filter Tabs */
.filter-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e1e5e9;
  padding-bottom: 1rem;
}

.filter-tab {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #6c757d;
  font-family: var(--font-medium);
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  position: relative;
}

.filter-tab:hover { color: var(--color-primary); background: rgba(17, 67, 88, 0.05); }

.filter-tab.active {
  color: var(--color-primary);
  background: rgba(17, 67, 88, 0.1);
  font-family: var(--font-semibold);
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--color-primary);
}

.notification-count {
  background: var(--color-first-complementary);
  color: var(--color-dark);
  font-size: 0.8rem;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  font-family: var(--font-bold);
}

/* Notification Body */
.notification-body {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon svg {
  width: 20px;
  height: 20px;
  color: var(--color-light);
}

.notification-content-text {
  flex: 1;
}

.notification-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.notification-time,
.notification-vehicle {
  font-family: var(--font-medium);
  font-size: 0.85rem;
  color: #6b7280;
}

.notification-vehicle {
  color: var(--color-primary);
}

.notification-indicator {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 8px;
  height: 8px;
  background: var(--color-first-complementary);
  border-radius: 50%;
}

.notification-card.read .notification-indicator {
  display: none;
}

/* Button States */
.mark-all-read-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .notification-view-container { padding: 1rem; }
  .notification-content { padding: 1.5rem 1rem; }
  .notification-title { font-size: 2rem; }
  .notification-header { flex-direction: column; gap: 1rem; align-items: stretch; }
  .mark-all-read-btn { align-self: center; }
  .filter-tabs { flex-wrap: wrap; }
  .notification-content-wrapper { flex-direction: column; }
  .notification-actions { align-self: flex-end; }

  .notification-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .notification-body {
    gap: 0.75rem;
  }

  .notification-icon {
    width: 32px;
    height: 32px;
  }

  .notification-icon svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: 480px) {
  .notification-content { padding: 1rem 0.5rem; }
  .notification-title { font-size: 1.8rem; }
  .notification-card { padding: 1rem; }
  .filter-tab { padding: 0.5rem 1rem; font-size: 0.9rem; }

  .section-title {
    font-size: 1.1rem;
  }

  .notification-body {
    gap: 0.5rem;
  }

  .notification-message {
    font-size: 0.9rem;
  }

  .notification-time,
  .notification-vehicle {
    font-size: 0.8rem;
  }
}
</style>