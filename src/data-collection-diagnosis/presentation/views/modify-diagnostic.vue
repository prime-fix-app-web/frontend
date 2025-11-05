<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import useIamStore from '@/iam/application/iam.store.js'
import useAutoRepairRegisterStore from "@/auto-repair-register/application/auto-repair.store.js";
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import {Diagnostic} from "@/data-collection-diagnosis/domain/model/diagnostic.entity.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";

import { useI18n } from 'vue-i18n'
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const iamStore = useIamStore()
const registerStore = useCatalogStore()
const dataCollectionStore = useDataCollection()
const diagnosisStore = useDataCollection()
const trackingStore = useTrackingStore()
const catalogStore = useCatalogStore()

const vehicleId = ref(null)
const loading = ref(false)
const newDiagnostic = ref(null)

const modifyForm = reactive({
  diagnosis: '',
  failure: '',
  price: 0
})

const steps = [
  { id: 1, label: 'En espera', translationKey: 'progress-bar.waiting' },
  { id: 2, label: 'En diagnóstico', translationKey: 'progress-bar.diagnosis' },
  { id: 3, label: 'En reparación', translationKey: 'progress-bar.repair' },
  { id: 4, label: 'En prueba', translationKey: 'progress-bar.testing' },
  { id: 5, label: 'Listo para recoger', translationKey: 'progress-bar.readyPickup' },
  { id: 6, label: 'Recogido', translationKey: 'progress-bar.collected' }
]

const currentAutoRepair = computed(() => {
  const userAccountId = iamStore.sessionUserAccount.id_user_account
  if (!userAccountId) return null
  return catalogStore.autoRepairs.find(ar => ar.id_user_account === userAccountId)
})

const currentVehicle = computed(() => {
  const id = vehicleId.value
  if (!id) return null
  return trackingStore.vehicles.find(v => v.id_vehicle === id) || null
})

const currentVisit = computed(() => {
  const vehicle = currentVehicle.value
  if (!vehicle) return null

  const autoRepairId = currentAutoRepair.value?.id_auto_repair
  if (!autoRepairId) return null

  return dataCollectionStore.visits.find(
      v => v.id_vehicle === vehicle.id_vehicle && v.id_auto_repair === autoRepairId
  ) || null
})

const currentOwner = computed(() => {
  const vehicle = currentVehicle.value
  if (!vehicle) return null
  return iamStore.users.find(u => u.id === vehicle.id_user) || null
})

const currentExpectedVisit = computed(() => {
  const visit = currentVisit.value
  if (!visit) return null
  return dataCollectionStore.expectedVisit.find(ev => ev.id_visit === visit.id_visit) || null
})

onMounted(() => {
  vehicleId.value = route.params.id || null
  console.log('🪪 route param id:', vehicleId.value);
  if (vehicleId.value) {
    setTimeout(() => {
      console.log('🚗 currentVehicle:', currentVehicle.value);
      console.log('📋 currentVisit:', currentVisit.value);
      const vehicle = currentVehicle.value
      const visit = currentVisit.value
      const diagnostic = newDiagnostic.value

      if (vehicle && visit) {
        modifyForm.failure = visit.failure || ''
        modifyForm.diagnosis = ''
        modifyForm.price = diagnostic?.price || 0
      }
    }, 100)
  }
})

function onSubmit() {
  if (!modifyForm.diagnosis || !modifyForm.failure || modifyForm.price < 0) {
    alert(t('vehicle-diagnosis.form-invalid'))
    return
  }

  const vehicle = currentVehicle.value
  const visit = currentVisit.value
  const expectedVisit = currentExpectedVisit.value

  if (!vehicle || !visit) {
    alert(t('vehicle-diagnosis.no-data'))
    return
  }

  if (!expectedVisit) {
    alert('No se encontró la visita esperada asociada')
    return
  }

  loading.value = true

  try {
    const diagnostic = new Diagnostic({
      id_diagnostic: generateDiagnosticId(),
      price: modifyForm.price,
      id_vehicle: vehicle.id_vehicle,
      diagnosis: modifyForm.diagnosis,
      id_expected: expectedVisit.id_expected
    })

    dataCollectionStore.addDiagnostic(diagnostic)

    setTimeout(() => {
      loading.value = false
      alert(t('vehicle-diagnosis.button-update'))
      router.push('/vehicle-diagnosis/diagnosis-view')
    }, 500)
  } catch (err) {
    console.error('Error updating diagnosis:', err)
    loading.value = false
    alert('Error al actualizar el diagnóstico')
  }
}

function onCancel() {
  router.push('/layout-workshop/visit/diagnosis-view')
}

function generateDiagnosticId() {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 1000)
  return `DIAG-${timestamp}-${random}`
}
</script>

<template>
  <div class="modify-diagnosis-container">
    <div class="modify-content">
      <h1 class="modify-title">{{ t('vehicle-diagnosis.title') }}</h1>
      <h2 class="modify-subtitle">{{ t('vehicle-diagnosis.subtitle-update') }}</h2>

      <div v-if="currentVehicle && currentVisit" class="modify-card">
        <div class="vehicle-summary">
          <div class="summary-row">
            <span class="summary-label">{{ t('vehicle-diagnosis.vehicle-card.car') }}</span>
            <span class="summary-value">{{ currentVehicle.vehicle_brand }} {{ currentVehicle.model }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">{{ t('vehicle-diagnosis.vehicle-card.plate') }}</span>
            <span class="summary-value">{{ currentVehicle.vehicle_plate }}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">{{ t('vehicle-diagnosis.vehicle-card.owner') }}</span>
            <span class="summary-value">
              <span v-if="currentOwner">{{ currentOwner.name }} {{ currentOwner.last_name }}</span>
              <span v-else>{{ t('vehicle-diagnosis.vehicle-card.unknown-owner') }}</span>
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">{{ t('vehicle-diagnosis.vehicle-card.id-visit') }}</span>
            <span class="summary-value">{{ currentVisit.id }}</span>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent="onSubmit" class="modify-form">
          <!-- Failure -->
          <div class="form-group">
            <label class="form-label">{{ t('vehicle-diagnosis.vehicle-form.failure') }}:</label>
            <span class="form-input">{{ currentVisit.failure || '' }}</span>
          </div>

          <!-- Diagnostic -->
          <div class="form-group">
            <label class="form-label">{{ t('vehicle-diagnosis.vehicle-form.diagnostic') }}</label>
            <textarea
                v-model="modifyForm.diagnosis"
                class="form-textarea"
                rows="4"
                placeholder="Describa el diagnóstico..."></textarea>
          </div>

          <!-- Price -->
          <div class="form-group">
            <label class="form-label">{{ t('vehicle-diagnosis.vehicle-form.price') }}</label>
            <input
                type="number"
                v-model.number="modifyForm.price"
                class="form-input"
                placeholder="0.00"
                step="0.01"
                min="0">
          </div>

          <!-- Buttons -->
          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="onCancel" :disabled="loading">
              {{ t('vehicle-diagnosis.button-cancel') }}
            </button>
            <button type="submit" class="btn-submit" :disabled="!modifyForm.diagnosis || loading">
              {{ loading ? t('vehicle-diagnosis.button-updating') : t('vehicle-diagnosis.button-add') }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="no-data">
        <p>{{ t('vehicle-diagnosis.no-data') }}</p>
        <button class="btn-back" @click="onCancel">{{ t('vehicle-diagnosis.button-cancel') }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modify Diagnosis Container */
.modify-diagnosis-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.modify-content {
  max-width: 700px;
  margin: 0 auto;
}

/* Title and Subtitle */
.modify-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

.modify-subtitle {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0 0 2rem 0;
}

/* Card */
.modify-card {
  background: var(--color-second-complementary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Vehicle Summary */
.vehicle-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid rgba(100, 145, 164, 0.2);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  color: var(--color-dark);
}

.summary-value {
  font-family: var(--font-regular);
  font-size: 0.95rem;
  color: var(--color-dark);
}

/* Form */
.modify-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  color: var(--color-dark);
}

/* Form Inputs */
.form-input,
.form-select,
.form-textarea {
  font-family: var(--font-regular);
  font-size: 1rem;
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-light);
  border-radius: 8px;
  background-color: var(--color-light);
  color: var(--color-dark);
  transition: all 0.3s ease;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(17, 67, 88, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23114358' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.form-input[type="number"] {
  appearance: textfield;
}

.form-input[type="number"]::-webkit-inner-spin-button,
.form-input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Error Text */
.error-text {
  font-family: var(--font-regular);
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn-cancel,
.btn-submit {
  font-family: var(--font-semibold);
  font-size: 1rem;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.btn-cancel {
  background-color: var(--color-light);
  color: var(--color-dark);
  border: 2px solid var(--color-tertiary-complementary);
}

.btn-cancel:hover:not(:disabled) {
  background-color: var(--color-tertiary-complementary);
  color: var(--color-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(100, 145, 164, 0.3);
}

.btn-submit {
  background-color: var(--color-first-complementary);
  color: var(--color-light);
}

.btn-submit:hover:not(:disabled) {
  background-color: #d99a1a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* No Data */
.no-data {
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  margin-top: 2rem;
}

.no-data p {
  font-family: var(--font-medium);
  font-size: 1.2rem;
  color: var(--color-dark);
  margin: 0 0 1.5rem 0;
}

.btn-back {
  font-family: var(--font-semibold);
  font-size: 1rem;
  padding: 0.875rem 2rem;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  background-color: white;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 67, 88, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .modify-diagnosis-container {
    padding: 1rem;
  }

  .modify-title {
    font-size: 2rem;
  }

  .modify-subtitle {
    font-size: 0.95rem;
  }

  .modify-card {
    padding: 1.5rem;
  }

  .summary-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {

  .modify-title {
    font-size: 1.5rem;
  }

  .modify-card {
    padding: 1.25rem;
  }
}


</style>