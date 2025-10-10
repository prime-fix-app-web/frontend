<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";

const store = useDataCollection();
const router = useRouter();

const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    await store.fetchAutoRepairs();
  } catch (e) {
    error.value = e.message || "Error al cargar talleres";
  } finally {
    loading.value = false;
  }
});

const selectRepair = (id) => {
  router.push({ name: "visit-form", query: { repairId: id } });
};

</script>

<template>
  <div>
    <div v-if="loading">Cargando talleres...</div>
    <div v-if="error">{{ error }}</div>

    <div v-if="!loading && !error" class="repair-cards-container">
      <div v-for="repair in store.autoRepairs" :key="repair.id" class="repair-card">
        <pv-card>
          <template #header>
            <h3>{{ repair.id }}</h3>
            <p>RUC: {{ repair.RUC }}</p>
          </template>
          <template #content>
            <p>Email: {{ repair.contact_email }}</p>
            <p>Técnicos: {{ repair.technician_count }}</p>
          </template>
          <template #footer>
            <pv-button color="primary" @click="selectRepair(repair.id_auto_repair)">
              Agendar Visita
            </pv-button>
          </template>
        </pv-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.repair-cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.repair-card {
  width: 300px;
}

.spinner-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.error-text {
  color: red;
  text-align: center;
  margin: 20px 0;
}
</style>
