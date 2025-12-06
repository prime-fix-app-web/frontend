<script setup>
import { useI18n } from "vue-i18n";
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import { useRoute, useRouter } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { Visit } from "@/data-collection-diagnosis/domain/model/visit.entity.js";
import useIamStore from "@/iam/application/iam.store.js";
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const dataStore = useDataCollection();
const iamStore = useIamStore();
const trackingStore = useTrackingStore();
const catalogStore = useCatalogStore();

const {errors, visits, addVisit, updateVisit, deleteVisit, fetchVisit} = dataStore;
const { fetchServices } = catalogStore;

const form = ref({
  vehicle_id: null,
  failure: "",
  time_visit: null,
  auto_repair_id: null,
  service_id: null,
});

const isEdit = computed(() => !!route.params.id);
const dialogVisible = ref(null);
const completedVisit = ref(false);
const editDialog = ref(false);

const filteredVehicles = computed(() => {
  const currentUser = iamStore.sessionUser;
  if (!currentUser || !currentUser.id) return [];

  if (!trackingStore.vehicles || !Array.isArray(trackingStore.vehicles)) return []

  return trackingStore.vehicles.filter(
      (v) => v.user_id === currentUser.id
  );
});

onMounted(async () => {
  await fetchServices();
  await trackingStore.fetchVehicles();

  if (!visits.length) await fetchVisit();

  const repairId = route.query.auto_repair_id || null;

  if (isEdit.value) {
    let visit = getVisitById(route.params.visit_id);
    if (!visit && !visits.length) {
      await fetchVisit();
      visit = getVisitById(route.params.visit_id);
    }

    if (visit) {
      form.value = {
        vehicle_id: visit.vehicle_id || null,
        failure: visit.failure || "",
        time_visit: visit.time_visit ? new Date(visit.time_visit) : null,
        auto_repair_id: repairId || visit.auto_repair_id || null,
        service_id: visit.service_id || null,
      };
    }
  } else {
    form.value = {
      vehicle_id: null,
      failure: "",
      time_visit: null,
      auto_repair_id: repairId,
      service_id: null,
    };
  }
});

function getVisitById(id) {
  return store.getVisitsById(id);
}

function saveVisit () {
  const visitData = {
    vehicle_id: form.value.vehicle_id,
    failure: form.value.failure,
    time_visit: form.value.time_visit ? form.value.time_visit.toISOString().split('T')[0] : null,
    auto_repair_id: form.value.auto_repair_id,
    service_id: form.value.service_id,
  };

  try {
    if (isEdit.value) {
      const visitId = route.params.id;
      updateVisit(visitId, visitData);
      editDialog.value = true;
    } else {
      const newVisit = {
        id: Math.floor(Math.random() * 1000000),
        ...visitData
      };
      addVisit(newVisit);
      completedVisit.value = {...form.value};
      editDialog.value = false;
    }
    dataStore.fetchVisit();
    dialogVisible.value = true;
  } catch (error) {
    console.error("Error al guardar visita:", error);
  }
}

const isFormValid = computed(() => {
  return form.value.vehicle_id &&
      form.value.failure &&
      form.value.time_visit &&
      form.value.service_id;
});


const navigate = () => router.push({ name: "auto_list" });
const goBack = () => router.back();

</script>

<template>
  <header class="main-header">
    <h1>{{t('visit-form.header')}}</h1>
  </header>

  <div class="workshop-form-container">
    <h2 class="form-title">{{t('visit-form.title')}}</h2>

    <div class="form-card">
      <form @submit.prevent="saveVisit">
        <div class="form-group">
          <label class="form-label">{{t('visit-form.vehicle_model')}}</label>
          <pv-select
              :options="filteredVehicles"
              optionLabel="model"
              optionValue="vehicle_id"
              v-model="form.vehicle_id"
              :placeholder="t('visit-form.vehicle_model')"
              class="full-width"
          />

        </div>

        <div class="form-group">
          <label class="form-label">{{t('visit-form.failure')}}</label>
          <pv-textarea
              :placeholder="t('visit-form.failure_details')"
              rows="3"
              autoResize
              class="full-width"
              v-model="form.failure"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{t('visit-form.type_of_service')}}</label>
          <pv-select
              :options="dataStore.services"
              optionLabel="name"
              optionValue="id"
              v-model="form.service_id"
              :placeholder="t('visit-form.select_service')"
              class="full-width"
          />
        </div>

        <div class="date-time-row">
          <div class="form-group half-width">
            <label class="form-label">{{t('visit-form.preferred_date')}} </label>
            <pv-floatlabel>
              <pv-datepicker class="custom-d" v-model="form.time_visit">
                <label>Over Label</label>
              </pv-datepicker>
            </pv-floatlabel>
          </div>
        </div>

        <div class="button-container">
          <pv-button type="submit" class="submit-button" :disabled="!isFormValid">{{t('buttons.add')}}</pv-button>
          <pv-button class="back-button" @click="goBack">{{t('visit-form.back')}}</pv-button>
        </div>
      </form>
    </div>
  </div>

  <pv-dialog
      v-model:visible="dialogVisible"
      :header="editDialog ? t('edit-screen.title') : t('completed-screen.title')"
      modal
      maximizable
      :style="{ width: '40rem' }"
      @hide="navigate"
  >
    <div v-if="completedVisit">
      <p class="success-message">{{ t('completed-screen.message') }}</p>
      <p><strong>{{ t('completed-screen.date') }}:</strong> {{ completedVisit.time_visit }}</p>
      <p><strong>{{ t('completed-screen.vehicle') }}:</strong> {{ trackingStore.getVehiclesById(completedVisit.vehicle_id)?.model }}</p>
      <p><strong>{{ t('completed-screen.service') }}:</strong> {{ dataStore.getServiceById(completedVisit.service_id)?.name }}</p>

      <div class="button-container">
        <pv-button class="back-button" @click="dialogVisible = false">{{ t('completed-screen.back') }}</pv-button>
        <pv-button class="submit-button" @click="router.push({ name: 'home-auto-repair-catalog' })">{{ t('completed-screen.visit_Scheduled') }}</pv-button>
      </div>
    </div>
  </pv-dialog>


</template>

<style scoped>


.p-dialog.p-component{
  background-color: #007bff ;
}



.workshop-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.p-select {
  background-color: #fff !important;
  box-shadow: none !important;
  color: #000 !important;
  border: 1px solid #ccc !important;

  --p-select-color: #000 !important;
  --p-inputtext-color: #000 !important;
}

.p-select-label
 {
  color: #000 !important;
  --p-select-color: #000 !important;
}


.p-dropdown-panel {
  background-color: #fff !important;
  color: #000 !important;
  --p-dropdown-color: #000 !important;
}

.p-dropdown-item:hover {
  background-color: #fdb825 !important;
  color: #000 !important;
}

.p-textarea {
  background-color: #fff !important;
  box-shadow: none !important;
  color: #000 !important;
  border: 1px solid #ccc !important;
}

.custom-d input.p-inputtext {
  background-color: #ffffff !important;
  color: #000 !important;
  border: 2px solid #fdb825 !important;
  border-radius: 10px !important;
  box-shadow: none !important;
}

::placeholder {
  color: #555 !important;
}

.form-title {
  color: #1a4d6d;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 3px solid #1a4d6d;
  padding-bottom: 10px;
}

.form-card {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 30px;
  margin-top: 20px;
  color: #000 !important;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #000 !important;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #000 !important;
  margin-bottom: 8px;
}

.full-width {
  width: 100%;
}

.date-time-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.half-width {
  flex: 1;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.submit-button {
  background-color: #fdb825 !important;
  color: #333 !important;
  font-weight: 600;
  padding: 10px 40px !important;
  border-radius: 25px !important;
  text-transform: none !important;
  font-size: 16px;
}

.submit-button:hover:not([disabled]) {
  background-color: #e5a620 !important;
}

.submit-button:disabled {
  opacity: 0.5;
}

.back-button {
  background-color: white !important;
  color: #000 !important;
}

/* === HEADER === */
.main-header {
  margin-bottom: 2rem;
}

.main-header h1 {
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 0;
  position: relative;
  padding-bottom: 1rem;
}

.main-header h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 200px;
  height: 4px;
  background-color: var(--color-primary);
}
</style>