<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from "@/iam/application/iam.store.js";
import useAutoRepairRegisterStore from "@/auto-repair-register/application/auto-repair.store.js";
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";

const route = useRoute();
const { t: translate } = useI18n();
const iamStore = useIamStore();
const dataCollectionStore = useDataCollection();
const catalogStore= useCatalogStore();
const trackingStore = useTrackingStore();


const vehicleId = ref(null);
const loading = ref(false);

const steps = [
  { id: 1, label: 'En espera', translationKey: 'progress-bar.waiting' },
  { id: 2, label: 'En diagnóstico', translationKey: 'progress-bar.diagnosis' },
  { id: 3, label: 'En reparación', translationKey: 'progress-bar.repair' },
  { id: 4, label: 'En prueba', translationKey: 'progress-bar.testing' },
  { id: 5, label: 'Listo para recoger', translationKey: 'progress-bar.readyPickup' },
  { id: 6, label: 'Recogido', translationKey: 'progress-bar.collected' }
];

const currentAutoRepair = computed(() => {
  const userAccountId = iamStore.sessionUserAccount?.id;
  if (!userAccountId) return null;
  return catalogStore.autoRepairs.find(ar => ar.id_user_account === userAccountId);
});

const currentVehicle = computed(() => {
  if (!vehicleId.value) return null;
  return trackingStore.vehicles.find(v => v.id_vehicle === vehicleId.value) || null;
});

const currentVisit = computed(() => {
  const vehicle = currentVehicle.value;
  if (!vehicle) return null;

  const autoRepairId = currentAutoRepair.value?.id_auto_repair;
  if (!autoRepairId) return null;

  return dataCollectionStore.visits.find(
      v => v.id_vehicle === vehicle.id_vehicle && v.id_auto_repair === autoRepairId
  ) || null;
});

const currentExpectedVisit = computed(() => {
  const visit = currentVisit.value;
  if (!visit) return null;
  return dataCollectionStore.expectedVisit.find(ev => ev.id_visit === visit.id_visit) || null;
});

const currentDiagnosticsByCurrentExpectedVisitId = computed(() => {
  const expectedVisit = currentExpectedVisit.value;
  if (!expectedVisit) return [];
  return dataCollectionStore.diagnostic.filter(d => d.id_expected === expectedVisit.id_expected);
});

onMounted(async () => {
  loading.value = true;

  await Promise.all([
    catalogStore.fetchAutoRepairs?.(),
    trackingStore.fetchVehicles?.(),
    dataCollectionStore.fetchVisit?.(),
    dataCollectionStore.fetchExpected?.(),
    dataCollectionStore.fetchDiagnostic?.()
  ]);

  vehicleId.value = route.params.id || null;

  loading.value = false;

});
</script>

<template>
  <div class="check-diagnostics-container">
    <div class="check-diagnostics-content">
      <h1 class="check-diagnostics-title">{{ translate('vehicleDiagnosis.checkTitle') }}</h1>
      <h2 class="check-diagnostics-subtitle">{{ translate('vehicleDiagnosis.checkSubtitle') }}</h2>

      <div v-if="loading" class="loading-message">
        {{ translate('vehicleDiagnosis.loading') }}
      </div>

      <div v-else-if="currentDiagnosticsByCurrentExpectedVisitId.length === 0" class="empty-state">
        <p class="empty-text">{{ translate('vehicleDiagnosis.noDiagnostics') }}</p>
      </div>

      <div class="diagnostics-list">
        <div
            v-for="diagnostic in currentDiagnosticsByCurrentExpectedVisitId"
            :key="diagnostic.id_diagnostic"
            class="diagnostic-card"
        >
          <div class="card-header">
            <h3 class="diagnostic-title">{{ diagnostic.diagnosis || 'No title' }}</h3>
          </div>

          <div class="card-body">
            <div class="diagnostic-info-row">
              <span class="info-label">{{ translate('vehicleDiagnosis.price') }}:</span>
              <span class="info-value">S/. {{ diagnostic.price ?? '0.00' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Check Diagnostics Container */
.check-diagnostics-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.check-diagnostics-content {
  max-width: 1000px;
  margin: 0 auto;
}

/* Title and Subtitle */
.check-diagnostics-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

.check-diagnostics-subtitle {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0 0 2rem 0;
}

/* Diagnostics List */
.diagnostics-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Diagnostic Card */
.diagnostic-card {
  background: var(--color-second-complementary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.diagnostic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
}

.diagnostic-title {
  font-family: var(--font-medium);
  font-size: 1.1rem;
  color: var(--color-primary);
  margin: 0;
  flex: 1;
}


/* Card Body */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.diagnostic-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.info-label {
  font-family: var(--font-regular);
  font-size: 0.95rem;
  color: var(--color-primary);
  font-weight: 600;
}

.info-value {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  text-align: right;
}

/* Messages */
.loading-message,
.empty-state {
  font-family: var(--font-regular);
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.loading-message {
  color: var(--color-primary);
  background-color: rgba(100, 145, 164, 0.1);
}

.empty-state {
  color: var(--color-dark);
  background-color: var(--color-second-complementary);
  border: 1px dashed rgba(0, 0, 0, 0.1);
}

.empty-text {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .check-diagnostics-container {
    padding: 1rem;
  }

  .check-diagnostics-title {
    font-size: 2rem;
  }

  .check-diagnostics-subtitle {
    font-size: 0.95rem;
  }

  .diagnostic-card {
    padding: 1.25rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

}

@media (max-width: 480px) {
  .check-diagnostics-title {
    font-size: 1.5rem;
  }

  .diagnostic-card {
    padding: 1rem;
  }

  .diagnostic-title {
    font-size: 1rem;
  }

  .info-label,
  .info-value {
    font-size: 0.9rem;
  }
}
</style>