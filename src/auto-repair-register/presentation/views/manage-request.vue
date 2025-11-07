<script setup>
import { ref, computed } from 'vue'
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import useIamStore from "@/iam/application/iam.store.js";
import useAutoRepairRegisterStore from "@/auto-repair-register/application/auto-repair.store.js";
import {ExpectedVisit} from "@/data-collection-diagnosis/domain/model/expected-visit.entity.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";

const dataCollectionStore = useDataCollection()
const iamStore = useIamStore()
const registerStore = useAutoRepairRegisterStore()
const catalogStore = useCatalogStore()
const trackingStore = useTrackingStore()

const showDetailsModal = ref(false)
const selectedExpectedVisitAndVisit = ref(null)
const isLoading = ref(false)

const sessionUserAccount = computed(() => iamStore.sessionUserAccount)

const currentAutoRepair = computed(() => {
  const userAccountId = sessionUserAccount.value?.id_auto_repair
  if (!userAccountId) return undefined
  return catalogStore.autoRepairs.find(ar => ar.id_user_account === userAccountId)
})

const pendingExpectedVisits = computed(() => {
  const visitsByAutoRepair = dataCollectionStore.visits.filter(
      v => v.id_auto_repair === currentAutoRepair.value?.id_auto_repair
  )
  const expectedVisitByVisit = dataCollectionStore.expectedVisit

  return expectedVisitByVisit.filter(
      ev =>
          visitsByAutoRepair.some(v => v.id_visit === ev.id_visit) &&
          !ev.is_scheduled &&
          ev.state_visit === 'Pending Visit'
  )
})

function getVisitByExpectedVisitId(id_expected_visit) {
  return computed(() => {
    const expectedVisit = dataCollectionStore.expectedVisit.find(ev => ev.id_expected === id_expected_visit)
    return dataCollectionStore.visits.find(v => v.id_visit === expectedVisit?.id_visit) || null
  })
}

function getUserFullNameByVisitId(id_visit) {
  return computed(() => {
    const visit = dataCollectionStore.visits.find(v => v.id_visit === id_visit)
    if (!visit) return 'Unknown User'

    const vehicle = trackingStore.vehicles.find(veh => veh.id_vehicle === visit.id_vehicle)
    if (!vehicle) return 'Unknown User'

    const user = iamStore.users.find(u => u.id_user === vehicle.id_user)
    return user ? `${user.name} ${user.last_name}` : 'Unknown User'
  })
}

function getVehicleByVehicleId(id_vehicle) {
  return computed(() => {
    return trackingStore.vehicles.find(v => v.id_vehicle === id_vehicle) || null
  })
}

function onShowDetails(expectedVisit, visit) {
  selectedExpectedVisitAndVisit.value = { expectedVisit, visit }
  showDetailsModal.value = true
}

function onCloseModal() {
  showDetailsModal.value = false
  selectedExpectedVisitAndVisit.value = null
}

function onAcceptExpectedVisit(expectedVisit) {
  const newExpectedVisit = new ExpectedVisit({
    id_expected: expectedVisit.id_expected,
    state_visit: 'Scheduled visit',
    id_visit: expectedVisit.id_visit,
    is_scheduled: true
  })
  dataCollectionStore.updateExpected(newExpectedVisit.id_expected, newExpectedVisit)
}

function onRejectExpectedVisit(expectedVisit) {
  const newExpectedVisit = new ExpectedVisit({
    id_expected: expectedVisit.id_expected,
    state_visit: 'Visit cannot be scheduled',
    id_visit: expectedVisit.id_visit,
    is_scheduled: false
  })
  dataCollectionStore.updateExpected(newExpectedVisit.id_expected, newExpectedVisit)
}

</script>

<template>
  <div class="requests-container">
    <h1 class="requests-title">{{ $t('manage-requests.title') }}</h1>

    <div class="requests-list">
      <div
          v-for="expectedVisit in pendingExpectedVisits"
          :key="expectedVisit.id_expected"
          class="request-card"
      >
        <div class="request-info">
          <h3 class="customer-name">
            {{ getUserFullNameByVisitId(expectedVisit.id_visit).value }}
          </h3>

          <div class="request-details">
            <p class="detail-item">
              <span class="detail-label">{{ $t('manage-requests.date') }}:</span>
              {{
                getVisitByExpectedVisitId(expectedVisit.id_expected).value?.time_visit?.slice(0, 10)
              }}
            </p>
            <p class="detail-item">
              <span class="detail-label">{{ $t('manage-requests.time') }}:</span>
              {{
                getVisitByExpectedVisitId(expectedVisit.id_expected).value?.time_visit?.slice(11, 16)
              }}
            </p>
          </div>
        </div>

        <div class="request-actions">
          <button
              class="btn-details"
              @click="onShowDetails(expectedVisit, getVisitByExpectedVisitId(expectedVisit.id_expected).value)"
          >
            {{ $t('manage-requests.details') }}
          </button>

          <button
              class="btn-accept"
              @click="onAcceptExpectedVisit(expectedVisit)"
              :disabled="isLoading"
          >
            {{ $t('manage-requests.accept') }}
          </button>

          <button
              class="btn-reject"
              @click="onRejectExpectedVisit(expectedVisit)"
              :disabled="isLoading"
          >
            {{ $t('manage-requests.reject') }}
          </button>
        </div>
      </div>

      <div v-if="pendingExpectedVisits.length === 0" class="no-requests">
        <p>{{ $t('manage-requests.noRequests') }}</p>
      </div>
    </div>
  </div>

  <!-- Visit Details Modal -->
  <div
      v-if="showDetailsModal && selectedExpectedVisitAndVisit"
      class="modal-overlay"
      @click="onCloseModal"
  >
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">{{ $t('manage-requests.visitDetails') }}</h2>

      <div class="modal-details">
        <div class="detail-group">
          <label class="detail-label">{{ $t('manage-requests.customerName') }}</label>
          <p class="detail-value">
            {{
              getUserFullNameByVisitId(
                  selectedExpectedVisitAndVisit.expectedVisit?.id_visit
              ).value
            }}
          </p>
        </div>

        <div class="detail-group">
          <label class="detail-label">{{ $t('manage-requests.vehicleModel') }}</label>
          <p class="detail-value">
            {{
              getVehicleByVehicleId(
                  selectedExpectedVisitAndVisit.visit?.id_vehicle
              ).value?.model
            }}
          </p>
        </div>

        <div class="detail-group">
          <label class="detail-label">{{ $t('manage-requests.failures') }}</label>
          <p class="detail-value failure-text">
            {{ selectedExpectedVisitAndVisit.visit?.failure }}
          </p>
        </div>

        <div class="detail-row">
          <div class="detail-group">
            <label class="detail-label">{{ $t('manage-requests.date') }}</label>
            <p class="detail-value">
              {{ selectedExpectedVisitAndVisit.visit?.time_visit?.slice(0, 10) }}
            </p>
          </div>

          <div class="detail-group">
            <label class="detail-label">{{ $t('manage-requests.time') }}</label>
            <p class="detail-value">
              {{ selectedExpectedVisitAndVisit.visit?.time_visit?.slice(11, 16) }}
            </p>
          </div>
        </div>
      </div>

      <button class="btn-close" @click="onCloseModal">
        {{ $t('manage-requests.close') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.requests-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.requests-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0 0 2rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

/* Requests List */
.requests-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.request-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.request-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Request Info */
.request-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.customer-name {
  font-family: var(--font-semibold);
  font-size: 1.3rem;
  color: var(--color-dark);
  margin: 0;
}

.request-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
}

.detail-label {
  font-family: var(--font-medium);
}

/* Request Actions */
.request-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
}

.btn-accept,
.btn-reject,
.btn-details {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 120px;
}

.btn-details {
  background-color: var(--color-primary);
  color: var(--color-light);
  box-shadow: 0 2px 8px rgba(52, 72, 115, 0.3);
}

.btn-details:hover {
  background-color: #2c4870;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 72, 115, 0.4);
}

.btn-accept {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
}

.btn-accept:hover:not(:disabled) {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.btn-reject {
  background-color: transparent;
  color: var(--color-first-complementary);
  border: 2px solid var(--color-first-complementary);
}

.btn-reject:hover:not(:disabled) {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

.btn-accept:disabled,
.btn-reject:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* No Requests Message */
.no-requests {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
}

.no-requests p {
  font-family: var(--font-regular);
  font-size: 1.2rem;
  color: var(--color-dark);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .requests-container {
    padding: 1rem;
  }

  .requests-title {
    font-size: 2rem;
  }

  .request-card {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .request-actions {
    flex-direction: row;
    width: 100%;
  }

  .btn-accept,
  .btn-reject {
    flex: 1;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .requests-title {
    font-size: 1.5rem;
  }

  .customer-name {
    font-size: 1.1rem;
  }

  .detail-item {
    font-size: 0.95rem;
  }

  .request-actions {
    flex-direction: column;
  }

  .btn-accept,
  .btn-reject {
    width: 100%;
  }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: var(--color-light);
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-title {
  font-family: var(--font-bold);
  font-size: 2rem;
  color: var(--color-primary);
  margin: 0 0 1.5rem 0;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-label {
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  color: var(--color-primary);
}

.detail-value {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
  padding: 0.75rem;
  background-color: var(--color-second-complementary);
  border-radius: 8px;
  border: 1px solid var(--color-primary);
}

.failure-text {
  min-height: 80px;
  white-space: pre-wrap;
}

.btn-close {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  background-color: var(--color-primary);
  color: var(--color-light);
  box-shadow: 0 2px 8px rgba(52, 72, 115, 0.3);
}

.btn-close:hover {
  background-color: #2c4870;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 72, 115, 0.4);
}

/* Modal Responsive */
@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }
}

</style>