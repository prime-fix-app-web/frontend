<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";

import ProgressBar from "@/maintenance-tracking/presentation/components/progress-bar.vue";
import StateError from "@/maintenance-tracking/presentation/components/state-error.vue";
import StateNotification from "@/maintenance-tracking/presentation/views/state-notification.vue";

import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";
import useIamStore from "@/iam/application/iam.store.js";

const trackingStore = useTrackingStore();
const iamStore = useIamStore();
const { t } = useI18n();

// UI state
const selectedVehicle = ref<any | undefined>(undefined);
const showProgressBar = ref(false);
const showError = ref(false);
const showNotificationModal = ref(false);
const hasNotification = ref(true);

// form
const trackForm = ref({
  selectedVehicle: "",
});


onMounted(() => {
  iamStore.restoreSessionFromStorage?.();
});

const vehiclesByUserId = computed(() => {
  const userId = iamStore.sessionUserId;

  if (!userId) return [];

  return trackingStore.vehicles.filter((v: any) => v.id_user === userId);
});

const isInvalid = computed(() => trackForm.value.selectedVehicle.trim().length === 0);

function onSelect() {
  if (isInvalid.value) return;

  const vehicleId = trackForm.value.selectedVehicle;

  selectedVehicle.value = vehiclesByUserId.value.find(
      (v) => v.id_vehicle === vehicleId
  );

  if (!selectedVehicle.value) return;

  if (selectedVehicle.value.state_maintenance === 0) {
    showError.value = true;
    showProgressBar.value = false;
  } else {
    showError.value = false;
    showProgressBar.value = true;
  }
}

function openNotificationModal() {
  showNotificationModal.value = true;
}

function closeNotificationModal() {
  showNotificationModal.value = false;
  hasNotification.value = false;
}
</script>

<template>
  <div class="track-vehicle-container">
    <div class="track-header">
      <h1 class="track-title">{{ t('track-vehicle.title') }}</h1>

      <button
          class="notification-button"
          @click="openNotificationModal"
          :class="{ 'has-notification': hasNotification }"
          type="button"
          aria-label="Notifications"
      >
        <svg class="bell-icon">
          <use href="./assets/icons/sprite.symbol.svg#bell"></use>
        </svg>

        <span
            v-if="hasNotification"
            class="notification-badge"
        ></span>
      </button>
    </div>

    <div class="track-content">

      <form @submit.prevent="onSelect" class="track-form">
        <div class="form-group">
          <label for="vehicle" class="form-label">
            {{ t('track-vehicle.selectVehicle') }}
          </label>

          <select
              id="vehicle"
              v-model="trackForm.selectedVehicle"
              class="form-select"
          >
            <option value="" disabled>
              {{ t('track-vehicle.selectVehiclePlaceholder') }}
            </option>

            <option
                v-for="vehicle in vehiclesByUserId"
                :key="vehicle.id_vehicle"
                :value="vehicle.id_vehicle"
            >
              {{ vehicle.vehicle_brand }} [{{ vehicle.vehicle_plate }}]
            </option>
          </select>

          <span
              class="error-message"
              v-if="!trackForm.selectedVehicle"
          >
            {{ t('track-vehicle.vehicleRequired') }}
          </span>
        </div>

        <button
            type="submit"
            class="select-button"
            :disabled="!trackForm.selectedVehicle"
        >
          {{ t('track-vehicle.select') }}
        </button>
      </form>

      <div v-if="showError" class="vehicle-info-section">
        <StateError />
      </div>

      <div
          v-if="showProgressBar && selectedVehicle"
          class="vehicle-info-section"
      >
        <div class="vehicle-details">
          <p class="vehicle-info">
            <strong>{{ t('track-vehicle.vehicle') }}:</strong>
            {{ selectedVehicle.vehicle_brand }} [{{ selectedVehicle.vehicle_plate }}]
          </p>

          <p class="status-info">
            <strong>{{ t('track-vehicle.status') }}:</strong>
          </p>
        </div>

        <div class="progress-section">
          <ProgressBar
              :currentStep="selectedVehicle.state_maintenance || 1"
              :currentVehicle="selectedVehicle"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Notification Modal -->
  <StateNotification
      v-if="showNotificationModal"
      @close="closeNotificationModal"
  />
</template>

<style scoped>
.track-vehicle-container {
  padding: 1.5rem;
  max-width: 900px;
  margin: 0 auto;
}

.track-content {
  background: var(--color-light);
  padding: 2.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* Header */
.header-with-notification {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 2.5rem;
}

.track-title {
  font-family: var(--font-bold);
  font-size: 2.5rem;
  color: var(--color-primary);
  text-align: center;
  margin: 0;
  border-bottom: 4px solid var(--color-primary);
  padding-bottom: 1rem;
  flex: 1;
}

/* Notification Button */
.notification-button {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  transition: all 0.3s ease;
}

.notification-button:hover {
  background: rgba(242, 170, 31, 0.1);
}

.bell-icon {
  width: 28px;
  height: 28px;
  color: var(--color-primary);
  transition: color 0.3s ease;
}

.notification-button:hover .bell-icon {
  color: var(--color-first-complementary);
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  background-color: #e74c3c;
  border-radius: 50%;
  border: 2px solid var(--color-light);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.notification-button:focus-visible {
  outline: 2px solid var(--color-first-complementary);
  outline-offset: 2px;
}

/* Form */
.track-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-family: var(--font-semibold);
  font-size: 1.2rem;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 1.25rem 1.5rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: var(--font-regular);
  background: var(--color-light);
  color: var(--color-dark);
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 60px;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
}

.form-select:hover {
  border-color: var(--color-primary);
}

.form-select option {
  padding: 1rem;
  font-family: var(--font-regular);
  font-size: 1.1rem;
}

.form-select option:disabled {
  color: #9ca3af;
}

.error-message {
  color: #e74c3c;
  font-size: 1rem;
  font-family: var(--font-medium);
  margin-top: 0.5rem;
}

.select-button {
  width: 100%;
  padding: 1.25rem 2rem;
  margin-top: 1rem;
  border: none;
  border-radius: 12px;
  background: var(--color-first-complementary);
  color: var(--color-dark);
  font-family: var(--font-bold);
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 60px;
}

.select-button:hover:not(:disabled) {
  background: #ffb700;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
}

.select-button:active:not(:disabled) {
  transform: translateY(0);
}

.select-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.progress-bar-content {
  margin-top: 3rem;
}

/* Vehicle Information and Progress Section */
.vehicle-info-section {
  background: var(--color-light);
  border: 2px solid #e1e5e9;
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
  color: var(--color-primary);
}

.vehicle-info-section:hover {
  border-color: var(--color-primary);
}

.vehicle-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.vehicle-title {
  font-family: var(--font-bold);
  font-size: 1.8rem;
  color: var(--color-primary);
  margin-bottom: 1rem;
  word-wrap: break-word;
}

.vehicle-specs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  max-width: 100%;
}

.vehicle-spec {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  min-width: 120px;
  margin: 0;
  flex: 1;
  max-width: 150px;
}

.status-section {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e1e5e9;
}

.status-title {
  font-family: var(--font-semibold);
  font-size: 1.3rem;
  color: var(--color-dark);
  margin: 0;
}

.progress-section {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
}

/* Responsive */
@media (max-width: 768px) {
  .track-vehicle-container {
    padding: 1rem;
  }

  .track-content {
    padding: 1.5rem 1rem;
  }

  .track-title {
    font-size: 1.8rem;
  }

  .vehicle-specs {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  .vehicle-spec {
    min-width: 200px;
    max-width: 250px;
    width: 100%;
  }

  .vehicle-title {
    font-size: 1.5rem;
  }

  .notification-button {
    position: static;
    transform: none;
    margin-left: 1rem;
  }

  .header-with-notification {
    justify-content: space-between;
  }

  .progress-section {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .track-vehicle-container {
    padding: 0.75rem;
  }

  .track-content {
    padding: 1rem 0.75rem;
  }

  .header-with-notification {
    margin-bottom: 1.5rem;
    flex-direction: column;
    gap: 1rem;
  }

  .track-title {
    font-size: 1.3rem;
    padding-bottom: 0.5rem;
    border-bottom-width: 3px;
    text-align: center;
  }

  .notification-button {
    width: 32px;
    height: 32px;
    position: static;
    transform: none;
    margin: 0;
  }

  .bell-icon {
    width: 18px;
    height: 18px;
  }

  .notification-badge {
    width: 8px;
    height: 8px;
    top: 3px;
    right: 3px;
    border-width: 1px;
  }

  .track-form {
    max-width: 100%;
    gap: 1.5rem;
  }

  .form-label {
    font-size: 1rem;
  }

  .form-select {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
    min-height: 50px;
  }

  .select-button {
    padding: 1rem 1.25rem;
    font-size: 1rem;
    min-height: 50px;
  }

  .vehicle-info-section {
    padding: 1.25rem;
    margin-top: 1.5rem;
  }

  .vehicle-title {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }

  .vehicle-specs {
    gap: 0.5rem;
  }

  .vehicle-spec {
    min-width: 100%;
    max-width: 100%;
    padding: 0.6rem 0.8rem;
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }

  .spec-label {
    font-size: 0.85rem;
    margin-bottom: 0;
  }

  .spec-value {
    font-size: 1rem;
  }

  .status-section {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .status-title {
    font-size: 1.1rem;
  }

  .progress-section {
    padding: 0.75rem 0.5rem;
    margin-top: 1rem;
    overflow-x: auto;
  }

  .progress-bar-content {
    margin-top: 1rem;
  }
}

@media (max-width: 360px) {
  .track-vehicle-container {
    padding: 0.5rem;
  }

  .track-content {
    padding: 0.75rem 0.5rem;
  }

  .track-title {
    font-size: 1.1rem;
  }

  .vehicle-info-section {
    padding: 1rem;
  }

  .vehicle-title {
    font-size: 1.1rem;
  }

  .vehicle-spec {
    padding: 0.5rem;
  }

  .spec-label,
  .spec-value {
    font-size: 0.8rem;
  }

  .progress-section {
    padding: 0.5rem 0.25rem;
  }
}

/* Focus and Accessibility */
.form-select:focus-visible,
.select-button:focus-visible {
  outline: 2px solid var(--color-first-complementary);
  outline-offset: 2px;
}

</style>