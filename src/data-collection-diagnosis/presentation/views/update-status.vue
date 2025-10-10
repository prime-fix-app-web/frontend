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
  status: 'Pendiente'
});

const isEdit = computed(() => !!route.params.id);

const statusOptions = ['Pendiente', 'En Proceso', 'Finalizado', 'Cancelado'];

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
        status: visit.status || "Pendiente",
      };
    } else {
      router.push({ name: 'auto_list' });
    }
  }
});

const saveVisit = async () => {
  if (!isEdit.value) return;

  const visitData = { status: form.value.status };
  try {
    const visitId = route.params.id;
    await updateVisit(visitId, visitData);
    router.push({ name: 'auto_list' });
  } catch (error) {
    console.error("Error al actualizar estado de la visita:", error);
  }
};

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
        <!-- VEHICLE -->
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

        <!-- FAILURE -->
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

        <!-- SERVICE -->
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

        <!-- DATE -->
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

        <!-- STATUS (editable) -->
        <div class="form-group">
          <label class="form-label">{{t('visit-form.status')}}</label>
          <pv-select
              :options="statusOptions"
              v-model="form.status"
              class="full-width"
          />
        </div>

        <div class="button-container">
          <pv-button type="submit" class="submit-button">Guardar Estado</pv-button>
          <pv-button class="back-button" @click="goBack">{{t('visit-form.back')}}</pv-button>
        </div>
      </form>
    </div>
  </div>
</template>
