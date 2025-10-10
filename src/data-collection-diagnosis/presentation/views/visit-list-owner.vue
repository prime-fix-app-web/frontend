<script setup>
import { useI18n } from "vue-i18n";
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const { t } = useI18n();
const router = useRouter();
const store = useDataCollection();
const { visits, fetchVisit, deleteVisit } = store;

const visitsList = ref([]);

onMounted(async () => {
  if (!visits.length) await fetchVisit();
  visitsList.value = store.visits;
});

const handleDelete = (visit) => {
  confirm.require({
    message: t('visit_list.confirm_delete', { vehicle: visit.vehicle_model }),
    header: t('visit_list.delete_header'),
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      visitsList.value = visitsList.value.filter(v => v.id_visit !== visit.id_visit);
    },
  });
};



const handleEdit = (id) => {
  router.push({ name: 'data-collection-visit-form', params: { id } });
};
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
                <h3 class="visit-title">{{ t('visit_list.vehicle_model') }} {{ visit.vehicle_model }}</h3>
                <p class="visit-feature"><b>{{ t('visit_list.vehicle_brand') }}</b> {{ visit.vehicle_brand }}</p>
                <p class="visit-feature"><b>{{ t('visit_list.service') }}</b> {{ visit.service_name }}</p>
                <p class="visit-feature"><b>{{ t('visit_list.failure') }}</b> {{ visit.failure }}</p>
                <p class="visit-feature"><b>{{ t('visit_list.date') }}</b> {{ visit.time_visit }}</p>
                <p class="visit-feature"><b>{{ t('visit_list.status') }}</b> {{ visit.status }}</p>
                <p class="visit-contact">
                  <b>{{ t('visit_list.contact') }}</b>
                  <a :href="'mailto:' + visit.contact_email" class="email-text">{{ visit.contact_email }}</a>
                </p>
              </div>
              <div class="card-buttons">
                <pv-button class="delete-button" @click="handleDelete(visit)">{{ t('visit_list.delete') }}</pv-button>
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