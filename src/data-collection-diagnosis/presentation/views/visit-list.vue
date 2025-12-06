<script setup>
import {ref, computed, onMounted} from 'vue'
import useIamStore from '@/iam/application/iam.store'
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import {useI18n} from "vue-i18n";

// Props
const props = defineProps({
  isNewVisits: {
    type: Boolean,
    required: true
  }
})

const { t } = useI18n();
const loading = ref(false);
const error = ref(null);

// Stores
const dataStore = useDataCollection()
const iamStore = useIamStore()
const trackingStore = useTrackingStore()
const catalogStore = useCatalogStore()
// Modal state
const isCancelModalOpen = ref(false)
const selectedVisitId = ref(null)
const modalLoading = ref(false)

/**
 * Filtered visits based on user ownership and maintenance state
 */
const filteredVisits = computed(() => {
  const currentUserId = iamStore.sessionUserId;
  if (!currentUserId) {
    console.warn('No current user ID found')
    return []
  }

  const allVisits = dataStore.visits
  const allVehicles = trackingStore.vehicles
  const isScheduled = props.isNewVisits

  const vehicleMap = new Map(allVehicles.map(v => [v.vehicle_id, v]))

  return allVisits.filter(visit => {
    const vehicle = vehicleMap.get(visit.vehicle_id)
    if (!vehicle) return false

    if (!iamStore.isCurrentUser(vehicle.user_id)) return false

    // Filter by maintenance state
    return isScheduled
        ? vehicle.state_maintenance < 6
        : vehicle.state_maintenance === 6
  })
})

onMounted(() => {
  iamStore.fetchUsers();
  trackingStore.fetchVehicles();
  dataStore.fetchVisit();
})

/**
 * Sum of diagnostic prices for a visit
 */
function countPriceDiagnosticByExpectedVisitId(visitId) {
  return computed(() => {
    const expectedVisit = dataStore.expectedVisit.find(ev => ev.visit_id === visitId)

    return dataStore.expectedVisit
        .filter(d => d.id === expectedVisit?.id)
        .reduce((sum, d) => sum + d.price, 0)
  })
}

/**
 * Modal actions
 */
function openCancelModal(visitId) {
  selectedVisitId.value = visitId
  isCancelModalOpen.value = true
}

function closeCancelModal() {
  if (modalLoading.value) return
  isCancelModalOpen.value = false
  selectedVisitId.value = null
}

function confirmCancelVisit() {
  const visitId = selectedVisitId.value
  if (!visitId) return

  modalLoading.value = true

  const expectedVisit = dataStore.expectedVisit.find(v => v.visit_id === visitId)
  if (!expectedVisit) {
    modalLoading.value = false
    closeCancelModal()
    return
  }

  dataStore.updateExpected({
    id: expectedVisit.id,
    state_visit: 'CANCELLED_VISIT',
    visit_id: visitId,
    is_scheduled: false,
    vehicle_id: expectedVisit.vehicle_id,
  })

  setTimeout(() => {
    modalLoading.value = false
    closeCancelModal()
  }, 500)
}

/**
 * Cancelled check
 */
function isVisitCancelled(visitId) {
  const expectedVisit = dataStore.expectedVisit.find(v => v.id === visitId)
  return expectedVisit?.state_visit === 'CANCELLED_VISIT' && !expectedVisit.is_scheduled
}

/**
 * Helpers to retrieve objects
 */
function getAutoRepair(id) {
  return catalogStore.getAutoRepairById(id)
}

function getUserAccountById(id) {
  return iamStore.getUserAccountById(id)
}

function getUserById(id) {
  return iamStore.getUserById(id)
}

function getLocationById(id) {
  return iamStore.getLocationById(id)
}

function getAddressByAutoRepair(autoRepairId) {
  return computed(() => {
    const autoRepair = getAutoRepair(autoRepairId)
    if (!autoRepair) return 'Unknown Location'

    const userAccount = getUserAccountById(autoRepair.user_account_id)
    if (!userAccount) return 'Unknown Location'

    const user = getUserById(userAccount.user_id)
    if (!user) return 'Unknown Location'

    const location = getLocationById(user.location_id)
    return location?.address ?? 'Unknown Location'
  })
}

</script>

<template>
  <div class="visit-list-container">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>

      <p>{{ t('visit_list.loading') }}</p>
    </div>
    <div v-if="error" class="error-message">
      <p>{{ error }}</p>
    </div>

    <div v-if="!loading && !error">
      <div class="visit-header-section">
        <h1 class="section-title">
          {{ isNewVisits ? t('visit_list.scheduledVisits') : t('visit_list.visitHistory') }}
        </h1>
      </div>

      <div class="visits-section">

        <div v-if="filteredVisits.length === 0" class="empty-state">
          <p>
            {{
              isNewVisits
                  ? t('visit_list.noScheduledVisits')
                  : t('visit_list.noHistory')
            }}
          </p>
        </div>


        <div v-else class="visits-container">
          <div v-for="visit in filteredVisits" :key="visit.id" class="visit-card">


            <div class="visit-header">
              <div class="visit-id">
                <span class="label">{{ t('visit_list.visitId') }}</span>
                <span class="value">{{ visit.id }}</span>

                <span
                    v-if="isNewVisits && isVisitCancelled(visit.id)"
                    class="label-cancelled"
                >
                  {{ t('visit_list.label-cancelled') }}
                </span>
              </div>
            </div>

            <!-- Body -->
            <div class="visit-body">
              <div class="visit-info-row">
                <div class="info-item">
                  <span class="info-label">{{ t('visit_list.workshop') }}</span>
                  <span class="info-value">
                    {{ getUserAccountById(getAutoRepair(visit.auto_repair_id)?.user_account_id)?.username || "N/A" }}
                  </span>
                </div>
              </div>

              <div class="visit-info-row">
                <div class="info-item">
                  <span class="info-label">{{ t('visit_list.date') }}</span>
                  <span class="info-value">{{ visit.time_visit || "N/A" }}</span>
                </div>
              </div>

              <div class="visit-info-row">
                <div class="info-item">
                  <span class="info-label">{{ t('visit_list.address') }}</span>
                  <span class="info-value">
                    {{ getAddressByAutoRepair(visit.auto_repair_id) || "N/A" }}
                  </span>
                </div>
              </div>

              <div class="visit-info-row" v-if="!isNewVisits">
                <div class="info-item">
                  <span class="info-label">{{ t('visit_list.price') }}</span>
                  <span class="info-value">
                    {{ countPriceDiagnosticByExpectedVisitId(visit.id) || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div v-if="isNewVisits" class="visit-actions">
              <button
                  class="btn-cancel"
                  :disabled="isVisitCancelled(visit.id)"
                  @click="openCancelModal(visit.id)"
              >
                {{
                  isVisitCancelled(visit.id)
                      ? t('visit_list.visitCancelled')
                      : t('visit_list.cancelVisit')
                }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal -->
  <div v-if="isCancelModalOpen" class="modal-backdrop" @click="closeCancelModal"></div>

  <div
      v-if="isCancelModalOpen"
      class="cancel-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancelModalTitle"
  >
    <header class="cancel-modal-header">
      <h2 id="cancelModalTitle" class="modal-title">{{ t('visit_list.cancelModal.title') }}</h2>
      <p class="modal-subtitle">{{ t('visit_list.cancelModal.subtitle') }}</p>
    </header>

    <section class="cancel-modal-body">
      <p class="warning-message">{{ t('visit_list.cancelModal.warning') }}</p>
      <div class="visit-details">
        <span class="detail-label">{{ t('visit_list.visitId') }}</span>
        <span class="detail-value">{{ selectedVisitId }}</span>
      </div>
    </section>

    <footer class="cancel-modal-actions">
      <button
          class="btn-back"
          @click="closeCancelModal"
          :disabled="modalLoading"
      >
        {{ t('visit_list.cancelModal.goBack') }}
      </button>

      <button
          class="btn-confirm-cancel"
          @click="confirmCancelVisit"
          :disabled="modalLoading"
      >
        {{
          modalLoading
              ? t('visit_list.cancelModal.cancelling')
              : t('visit_list.cancelModal.confirm')
        }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.visit-list-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-second-complementary);
  border-top: 4px solid var(--color-first-complementary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  font-family: var(--font-medium);
  color: var(--color-primary);
  font-size: 1rem;
}

.error-message {
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
}

.error-message p {
  color: #c33;
  font-family: var(--font-medium);
  margin: 0;
}

.visits-section {
  width: 70%;
}

.visit-header-section {
  border-bottom: 3px solid var(--color-primary);
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
}

.section-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0;
}

.visits-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.visit-card {
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.visit-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.visit-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e0d8d0;
}

.visit-id {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.visit-id .label {
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  color: var(--color-primary);
}

.visit-id .value {
  font-family: var(--font-bold);
  font-size: 1.1rem;
  color: var(--color-dark);
}

.visit-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.visit-info-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
  min-width: 200px;
}

.info-label {
  font-family: var(--font-semibold);
  font-size: 0.875rem;
  color: var(--color-primary);
}

.info-value {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
}

.visit-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e0d8d0;
}

.btn-cancel {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  font-family: var(--font-semibold);
  font-size: 1rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-cancel:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(242, 170, 31, 0.3);
}

.btn-cancel:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  margin: 1rem 0;
}

.empty-state p {
  font-family: var(--font-medium);
  font-size: 1.1rem;
  color: var(--color-tertiary-complementary);
  margin: 0;
}

.label-cancelled {
  display: inline-block;
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
  font-family: var(--font-semibold);
  font-size: 0.85rem;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  margin-left: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  line-height: 1;
}

.btn-cancel:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-cancel:disabled:hover {
  transform: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 90;
  transition: opacity 180ms ease-in-out;
  opacity: 1;
}

/* Cancel Modal */
.cancel-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  width: min(520px, 95%);
  max-width: 520px;
  background: var(--color-light);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 18px 40px rgba(17, 67, 88, 0.12), 0 6px 18px rgba(0,0,0,0.06);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 220ms cubic-bezier(.2,.9,.3,1), opacity 180ms ease;
  opacity: 1;
  border: 1px solid rgba(17, 67, 88, 0.04);
}

/* Modal Header */
.cancel-modal-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.75rem;
}

.cancel-modal .modal-title {
  font-family: var(--font-bold);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0;
}

.cancel-modal .modal-subtitle {
  font-family: var(--font-regular);
  font-size: 0.95rem;
  color: var(--color-dark);
  margin: 0;
  line-height: 1.4;
  opacity: 0.9;
}

/* Modal Body */
.cancel-modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.warning-message {
  font-family: var(--font-medium);
  font-size: 1rem;
  color: #c33;
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 1rem;
  margin: 0;
  line-height: 1.5;
}

.visit-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--color-second-complementary);
  border-radius: 8px;
  padding: 0.75rem 1rem;
}

.detail-label {
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  color: var(--color-primary);
}

.detail-value {
  font-family: var(--font-bold);
  font-size: 1rem;
  color: var(--color-dark);
}

/* Modal Actions */
.cancel-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.5rem;
  align-items: center;
}

.btn-back {
  background: transparent;
  border: 1px solid rgba(0,0,0,0.08);
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  color: var(--color-dark);
  font-family: var(--font-semibold);
  font-size: 1rem;
  transition: background 140ms ease, transform 120ms ease, box-shadow 140ms ease;
  box-shadow: 0 4px 10px rgba(0,0,0,0.03);
}

.btn-back:hover:not(:disabled) {
  background: rgba(0,0,0,0.02);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.06);
}

.btn-back:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm-cancel {
  background: #c33;
  color: var(--color-light);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-family: var(--font-semibold);
  font-size: 1rem;
  min-width: 140px;
  transition: background 140ms ease, transform 120ms ease, box-shadow 160ms ease;
  box-shadow: 0 4px 12px rgba(204, 51, 51, 0.2);
}

.btn-confirm-cancel:hover:not(:disabled) {
  background: #a22;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(204, 51, 51, 0.3);
}

.btn-confirm-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 12px rgba(204, 51, 51, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .cancel-modal {
    width: 92%;
    padding: 1.25rem;
  }

  .cancel-modal-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-back,
  .btn-confirm-cancel {
    width: 100%;
  }

  .visit-list-container {
    padding: 1rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .visit-header-section {
    margin-bottom: 1.5rem;
  }

  .visit-card {
    padding: 1rem;
  }

  .info-item {
    min-width: 100%;
  }

  .btn-cancel {
    width: 100%;
  }

  .visit-actions {
    justify-content: stretch;
  }
}


</style>