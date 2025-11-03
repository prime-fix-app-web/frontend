<script setup>
import {useI18n} from "vue-i18n";
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import {useRoute, useRouter} from "vue-router";
import {computed,onMounted, ref} from "vue";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const store = useDataCollection();
const {errors, visits, updateVisit, fetchVisit, fetchServices, fetchVehicles, fetchAutoRepairs} = store;

const form = ref({
  id_vehicle: null,
  failure: '',
  time_visit: null,
  id_auto_repair: null,
  id_service: null,
  status: 'En espera'
});

const isEdit = computed(() => !!route.params.id);

const statusOptions = ['En espera', 'En Proceso', 'Completado', 'Cancelado'];

const dialogVisible = ref(false);

onMounted(async () => {
  await fetchVehicles();
  await fetchServices();
  await fetchAutoRepairs();
  if (!visits.length) await fetchVisit();

  if (isEdit.value) {
    const visit = store.getVisitsById(route.params.id);
    if (visit) {
      form.value = {
        id_vehicle: visit.id_vehicle || null,
        failure: visit.failure || '',
        time_visit: visit.time_visit ? new Date(visit.time_visit) : null,
        id_auto_repair: visit.id_auto_repair || null,
        id_service: visit.id_service || null,
        status: visit.status || "En espera",
      };
    } else {
      router.push({ name: 'list-workshop' });
    }
  }
});

const updateStatusVisit = async () => {
  if (!isEdit.value) return;

  const visitId = route.params.id;
  const visitData = { status: form.value.status };

  const visitIndex = visits.findIndex(v => v.id_visit === visitId);
  if (visitIndex !== -1) {
    visits[visitIndex] = { ...visits[visitIndex], ...visitData };
  }

  try {
    await updateVisit(visitId, visitData);
    dialogVisible.value=true;
    router.push({ name: 'list-workshop'});
  } catch (error) {
    console.error("Error al actualizar estado de la visita:", error);
  }
};


const goBack = () => router.back();
</script>

<template>
  <header class="main-header">
    <h1>{{t('visit-form.header-workshop')}}</h1>
  </header>

  <div class="workshop-form-container">
    <h2 class="form-title">{{t('visit-form.title-update')}}</h2>

    <div class="form-card">
      <form @submit.prevent="updateStatusVisit">

        <div class="form-group">
          <label class="form-label">{{t('visit-form.vehicle_model')}}</label>
          <pv-select
              :options="store.vehicles"
              optionLabel="model"
              optionValue="id_vehicle"
              v-model="form.id_vehicle"
              class="full-width"
              disabled
          />
        </div>


        <div class="form-group">
          <label class="form-label">{{t('visit-form.failure')}}</label>
          <pv-textarea
              rows="3"
              autoResize
              class="full-width"
              v-model="form.failure"
              disabled
          />
        </div>


        <div class="form-group">
          <label class="form-label">{{t('visit-form.type_of_service')}}</label>
          <pv-select
              :options="store.services"
              optionLabel="name"
              optionValue="id_service"
              v-model="form.id_service"
              class="full-width"
              disabled
          />
        </div>


        <div class="date-time-row">
          <div class="form-group half-width">
            <label class="form-label">{{t('visit-form.preferred_date')}}</label>
            <pv-datepicker
                v-model="form.time_visit"
                class="custom-d"
                disabled
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{t('visit-form.status')}}</label>
          <pv-select
              :options="statusOptions"
              v-model="form.status"
              class="full-width"
          />
        </div>

        <div class="button-container">
          <pv-button type="submit" class="submit-button">{{t('buttons.update-visit')}}</pv-button>
          <pv-button class="back-button" @click="goBack">{{t('visit-form.back')}}</pv-button>
        </div>
      </form>
    </div>
  </div>

  <pv-dialog
      v-model:visible="dialogVisible"
      :header="t('visit-form.status_updated')"
      modal
      maximizable
      :style="{ width: '30rem' }"
      @hide="dialogVisible = false"
  >
    <div v-if="form">
      <p class="success-message">
        {{ t('visit-form.status_now') }}: <strong>{{ form.status }}</strong>
      </p>

      <div class="button-container">
        <pv-button class="back-button" @click="dialogVisible = false">
          {{ t('visit-form.close') }}
        </pv-button>
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