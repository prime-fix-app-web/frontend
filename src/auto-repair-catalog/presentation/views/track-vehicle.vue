<template>
  <div class="page">
    <header class="main-header"><h1>{{ $t('track-vehicle.title') }}</h1></header>

    <label>Vehículo</label>
    <select v-model="selectedId" class="input">
      <option v-for="v in store.vehicles" :key="v.id" :value="v.id">{{ v.vehicle_plate }} - {{ v.vehicle_brand }} {{ v.model }}</option>
    </select>

    <div v-if="selectedId" class="progress">
      <div v-for="(s,i) in steps" :key="s" class="step" :class="{active: i<=activeIndex}">{{ s }}</div>
    </div>

    <div v-if="selectedId && !currentStatus" class="empty">Este coche no está siendo reparado</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import useTrackingStore from '@/maintenance-tracking/application/tracking.store.js'

const store = useTrackingStore()
const selectedId = ref('')

onMounted(async () => {
  await Promise.all([
    store.fetchVehicles(),
  ])
  if (store.vehicles.length) selectedId.value = store.vehicles[0].id
})

const selectedVehicle = computed(() => {
  if (!selectedId.value) return null
  return store.vehicles.find(v => v.id == selectedId.value)
})

const currentStatus = computed(() => {
  if (!selectedId.value) return ''
  const visits = store.visitsByVehicle(selectedId.value)
  if (!visits.length) return ''
  return visits[visits.length - 1].status || ''
})

const maintenanceStatusText = computed(() => {
  if (!selectedVehicle.value) return ''
  const status = selectedVehicle.value.maintenance_status
  const statusMap = {
    0: 'Sin servicio',
    1: 'En espera',
    2: 'En diagnóstico',
    3: 'En reparación',
    4: 'En prueba',
    5: 'Listo para recoger',
    6: 'Recogido'
  }
  return statusMap[status] || 'Desconocido'
})

const statusClass = computed(() => {
  if (!selectedVehicle.value) return ''
  const status = selectedVehicle.value.maintenance_status
  if (status === 0) return 'status-idle'
  if (status >= 1 && status <= 2) return 'status-waiting'
  if (status >= 3 && status <= 4) return 'status-in-progress'
  if (status === 5) return 'status-ready'
  if (status === 6) return 'status-completed'
  return ''
})

const statusText = computed(() => {
  if (!selectedVehicle.value) return ''
  const status = selectedVehicle.value.maintenance_status
  if (status === 0) return '⚪ Sin servicio'
  if (status >= 1 && status <= 2) return '🟡 En espera'
  if (status >= 3 && status <= 4) return '🔵 En proceso'
  if (status === 5) return '🟢 Listo'
  if (status === 6) return '✅ Completado'
  return ''
})

const steps = ['En espera', 'En diagnóstico', 'En reparación', 'En prueba', 'Listo para recoger', 'Recogido']
const activeIndex = computed(() => {
  if (!selectedVehicle.value) return -1
  return selectedVehicle.value.maintenance_status - 1
})
</script>

<style scoped>
.page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.main-header h1 {
  font-family: var(--font-bold);
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 0 0 2rem 0;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

/* Vehicle Selector Card */
.vehicle-selector-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-semibold);
  font-size: 1.1rem;
  color: var(--color-dark);
  margin-bottom: 1rem;
}

.selector-label .icon {
  font-size: 1.5rem;
}

.input {
  width: 100%;
  height: 48px;
  border: 2px solid var(--color-primary);
  border-radius: 12px;
  padding: 0 1rem;
  font-family: var(--font-regular);
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.input:hover {
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 3px rgba(242, 170, 31, 0.1);
}

.input:focus {
  outline: none;
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 4px rgba(242, 170, 31, 0.2);
}

/* Vehicle Info Card */
.vehicle-info-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  border: 2px solid var(--color-primary);
}

.info-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.vehicle-icon {
  font-size: 3rem;
}

.vehicle-details {
  flex: 1;
}

.vehicle-details h2 {
  font-family: var(--font-bold);
  font-size: 1.8rem;
  color: var(--color-dark);
  margin: 0 0 0.5rem 0;
}

.plate-number {
  font-family: var(--font-semibold);
  font-size: 1.2rem;
  color: var(--color-primary);
  background: var(--color-first-complementary);
  padding: 0.25rem 1rem;
  border-radius: 8px;
  display: inline-block;
}

.status-badge {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  white-space: nowrap;
}

.status-idle {
  background: #e0e0e0;
  color: #666;
}

.status-waiting {
  background: #fff9c4;
  color: #f57c00;
}

.status-in-progress {
  background: #bbdefb;
  color: #1976d2;
}

.status-ready {
  background: #c8e6c9;
  color: #388e3c;
}

.status-completed {
  background: #a5d6a7;
  color: #2e7d32;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item .label {
  font-family: var(--font-medium);
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item .value {
  font-family: var(--font-semibold);
  font-size: 1.1rem;
  color: var(--color-dark);
}

/* Stepper Container */
.stepper-container {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.stepper-title {
  font-family: var(--font-bold);
  font-size: 1.5rem;
  color: var(--color-primary);
  margin: 0 0 2rem 0;
  text-align: center;
}

/* Horizontal Stepper */
.stepper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  padding: 2rem 0;
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #e0e0e0;
  border: 3px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-bold);
  font-size: 1.2rem;
  color: #999;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.step-wrapper.active .step-circle {
  background: var(--color-first-complementary);
  border-color: var(--color-first-complementary);
  color: var(--color-dark);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.step-wrapper.completed .step-circle {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.check-icon {
  font-size: 1.8rem;
}

.step-number {
  font-size: 1.2rem;
}

.step-label {
  margin-top: 1rem;
  font-family: var(--font-medium);
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  max-width: 120px;
  line-height: 1.3;
}

.step-wrapper.active .step-label {
  color: var(--color-dark);
  font-family: var(--font-bold);
}

.step-wrapper.completed .step-label {
  color: var(--color-primary);
  font-family: var(--font-semibold);
}

.step-line {
  position: absolute;
  top: 30px;
  left: 50%;
  width: 100%;
  height: 3px;
  background: #e0e0e0;
  z-index: 1;
}

.step-wrapper.completed .step-line {
  background: var(--color-primary);
}

.step-wrapper.active .step-line {
  background: linear-gradient(to right, var(--color-primary) 0%, #e0e0e0 100%);
}

/* Empty State */
.empty-state-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state-card h3 {
  font-family: var(--font-bold);
  font-size: 1.5rem;
  color: var(--color-dark);
  margin: 0 0 0.5rem 0;
}

.empty-state-card p {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: #666;
  margin: 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .page {
    padding: 1rem;
  }

  .main-header h1 {
    font-size: 1.8rem;
  }

  .vehicle-info-card,
  .stepper-container {
    padding: 1.5rem;
  }

  .info-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .status-badge {
    align-self: flex-start;
  }

  .stepper {
    flex-direction: column;
    gap: 2rem;
  }

  .step-wrapper {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
  }

  .step-line {
    display: none;
  }

  .step-label {
    margin-top: 0;
    margin-left: 1rem;
    text-align: left;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .vehicle-details h2 {
    font-size: 1.3rem;
  }

  .step-circle {
    width: 50px;
    height: 50px;
    font-size: 1rem;
  }

  .check-icon {
    font-size: 1.5rem;
  }
}
</style>
