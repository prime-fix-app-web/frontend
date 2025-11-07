<script setup>
import { useI18n } from "vue-i18n";
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const store = useDataCollection();
const { visits, fetchVisit, deleteVisit,fetchVehicles,fetchServices,fetchAutoRepairs } = store;

const visitsList = ref([]);

onMounted(async () => {
  if (!visits.length) await fetchVisit();
  if (!store.vehiclesLoaded) await fetchVehicles();
  if (!store.servicesLoaded) await fetchServices();
  if (!store.autoRepairsLoaded) await fetchAutoRepairs();

  visitsList.value = store.visits;

});

const getVehicleById = (id) => store.getVehiclesById(id);
const getServiceById = (id) => store.getServicesById(id);
const getAutoRepairById = (id) => store.getAutoRepairsById(id);

const editVisit = (id) => {
  router.push({ name: 'edit', params: { id } });
}
</script>

<template>
  <div class="vehicles-container">
    <div class="cards-container">
      <h2 class="title">{{ t('visit_list.title') }}</h2>

      <div class="vehicle-card" v-for="visit in visitsList" :key="visit.id">
        <pv-card>
          <template #content>
            <div class="card-content">
              <div class="card-info">
                <h3 class="visit-title">{{ t('visit_list.vehicle_model') }} {{ getVehicleById(visit.id_vehicle)?.model}}</h3>
                <p class="visit-feature"><b>{{ t('visit_list.vehicle_brand') }}</b> {{ getVehicleById(visit.id_vehicle)?.vehicle_brand }}</p>
                <p class="visit-feature"><b>{{ t('visit_list.service') }}</b> {{ getServiceById(visit.id_service)?.name}}</p>
                <p class="visit-feature"><b>{{ t('visit_list.failure') }}</b> {{ visit.failure }}</p>
                <p class="visit-feature"><b>{{ t('visit_list.date') }}</b> {{ visit.time_visit }}</p>
                <p class="visit-feature"><b>{{ t('visit_list.status') }}</b> {{ visit.status }}</p>
                <p class="visit-contact">
                  <b>{{ t('visit_list.contact') }}</b>
                  <a :href="'mailto:' + visit.contact_email" class="email-text">{{ getAutoRepairById(visit.id_auto_repair)?.contact_email }}</a>
                </p>
              </div>
              <div class="card-buttons">
                <pv-button class="edit-button" @click="editVisit(visit.id_visit)">{{ t('visit_list.edit') }}</pv-button>
                <pv-button class="delete-button" @click="store.deleteVisit(visit.id_visit)">{{ t('visit_list.delete') }}</pv-button>
              </div>
            </div>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vehicles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.vehicle-card {
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.p-card {
  background-color: transparent !important;
  box-shadow: none !important;
}

.card-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.card-info {
  flex: 1;
}

.visit-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 8px;
  font-weight: 700;
}

.visit-feature {
  font-size: 16px;
  color: #555;
  margin: 2px 0;
}

.visit-contact {
  font-size: 16px;
  color: #555;
  margin-top: 6px;
}

.email-text {
  color: #007bff;
  text-decoration: underline;
}

.email-text:hover {
  color: #e6cc34;
  cursor: pointer;
}

.card-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 120px;
}

.edit-button,
.delete-button {
  background-color: #fdb825 !important;
  color: #333 !important;
  font-weight: 600;
  border-radius: 20px !important;
  text-transform: none !important;
  font-size: 14px;
  padding: 8px 20px !important;
  width: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}

.edit-button:hover,
.delete-button:hover {
  background-color: #e5a620 !important;
}

@media (max-width: 768px) {
  .card-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-buttons {
    width: 100%;
    flex-direction: row;
    justify-content: flex-start;
  }

  .edit-button,
  .delete-button {
    width: auto;
  }
}

.title {
  color: #1a4d6d;
  font-size: 40px;
  font-weight: bold;
  margin-bottom: 10px;
  border-bottom: 6px solid #1a4d6d;
  padding-bottom: 15px;
}

</style>