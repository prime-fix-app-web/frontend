<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { storeToRefs } from "pinia";
import useAutoRepairRegisterStore from "@/auto-repair-register/application/auto-repair.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import { Technician } from "@/auto-repair-register/domain/model/technician.entity.js";
import { TechnicianSchedule } from "@/auto-repair-register/domain/model/technician-schedule.entity.js";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// Stores
const registerStore = useAutoRepairRegisterStore();
const iamStore = useIamStore();
const catalogStore = useCatalogStore();

// State reactivo usando storeToRefs
const { technicians, techniciansSchedule } = storeToRefs(registerStore);
const { sessionUserAccount } = storeToRefs(iamStore);
const { autoRepairs } = storeToRefs(catalogStore);

// Funciones del store (sin storeToRefs)
const {
  addTechnician,
  addTechnicianSchedule,
  updateTechnician,
  updateTechnicianSchedule,
  deleteTechnicianSchedule,
  getTechnicianById,
  fetchTechnicians,
  fetchTechnicianSchedule
} = registerStore;

const { fetchAutoRepairs } = catalogStore;

const isEdit = ref(false);
const technicianId = ref(null);
const currentTechnician = ref(null);

const form = ref({
  name: "",
  last_name: "",
  schedules: []
});

const availableDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];

const daysOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7
};

const daysMap = computed(() => ({
  Monday: t("manage-technicians.technician-card.monday"),
  Tuesday: t("manage-technicians.technician-card.tuesday"),
  Wednesday: t("manage-technicians.technician-card.wednesday"),
  Thursday: t("manage-technicians.technician-card.thursday"),
  Friday: t("manage-technicians.technician-card.friday"),
  Saturday: t("manage-technicians.technician-card.saturday"),
  Sunday: t("manage-technicians.technician-card.sunday"),
}));

function translateDay(day) {
  return daysMap.value[day] || day;
}

const autoRepair = computed(() => {
  const userAccount = sessionUserAccount.value;
  if (!userAccount) return undefined;
  return autoRepairs.value.find(
      (ar) => ar.user_account_id === userAccount.id
  );
});

onMounted(async () => {
  // Cargar datos necesarios
  await Promise.all([
    fetchAutoRepairs(),
    fetchTechnicians(),
    fetchTechnicianSchedule()
  ]);

  const id = route.params.id;
  if (id) {
    isEdit.value = true;
    technicianId.value = id;
    loadTechnicianData(id);
  } else {
    addScheduleRow();
  }
});

function loadTechnicianData(id) {
  const technician = getTechnicianById(id);
  if (!technician) {
    console.error("Technician not found");
    router.push("/layout-workshop/auto-repair-register/technicians");
    return;
  }

  currentTechnician.value = technician;
  form.value.name = technician.name;
  form.value.last_name = technician.last_name;

  const allSchedules = techniciansSchedule.value;
  const technicianSchedules = allSchedules.filter(
      (s) => s.technician_id === id && s.is_active
  );

  const sortedSchedules = technicianSchedules.sort((a, b) => {
    return (daysOrder[a.day_of_week] ?? 999) - (daysOrder[b.day_of_week] ?? 999);
  });

  form.value.schedules = sortedSchedules.length
      ? sortedSchedules.map((s) => ({
        id: s.id,
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      }))
      : [{ day_of_week: "Monday", start_time: "09:00", end_time: "17:00" }];
}

function addScheduleRow() {
  form.value.schedules.push({
    id: null,
    day_of_week: "Monday",
    start_time: "09:00",
    end_time: "17:00",
  });
}

function removeScheduleRow(index) {
  if (form.value.schedules.length > 1) {
    form.value.schedules.splice(index, 1);
  }
}

function onSubmit() {
  const autoRepairData = autoRepair.value;
  if (!autoRepairData) {
    console.error("Auto repair not found");
    return;
  }

  if (!form.value.name || !form.value.last_name) {
    alert("Por favor, completa los campos requeridos");
    return;
  }

  if (isEdit.value) {
    handleUpdateTechnician(autoRepairData.id);
  } else {
    handleCreateTechnician(autoRepairData.id);
  }
}

async function handleCreateTechnician(autoRepairId) {
  try {
    // Crear técnico sin ID temporal
    const technician = new Technician({
      id: null, // El backend generará el ID
      name: form.value.name,
      last_name: form.value.last_name,
      auto_repair_id: autoRepairId,
    });

    // Esperar a que se cree el técnico y obtener el técnico con ID real
    const createdTechnician = await addTechnician(technician);

    // Usar el ID real del backend para crear los schedules
    for (const schedule of form.value.schedules) {
      const newSchedule = new TechnicianSchedule({
        id: null, // El backend generará el ID
        technician_id: createdTechnician.id, // Usar el ID real del backend
        day_of_week: schedule.day_of_week,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        is_active: true,
      });
      await addTechnicianSchedule(newSchedule);
    }

    router.push("/layout-workshop/auto-repair-register/technicians");
  } catch (error) {
    console.error('Error creating technician:', error);
    alert('Error al crear el técnico. Por favor, intenta de nuevo.');
  }
}

function handleUpdateTechnician(autoRepairId) {
  const id = technicianId.value;
  if (!id) return;

  const updatedTechnician = new Technician({
    id: id,
    name: form.value.name,
    last_name: form.value.last_name,
    auto_repair_id: autoRepairId,
  });
  updateTechnician(updatedTechnician.id, updatedTechnician);

  const existingSchedules = techniciansSchedule.value.filter(
      (s) => s.technician_id === id
  );

  const formSchedules = form.value.schedules;
  const schedulesToDelete = existingSchedules.filter(
      (ex) => !formSchedules.some((f) => f.id === ex.id)
  );

  const schedulesToUpdate = formSchedules.filter(
      (f) => f.id && existingSchedules.some((ex) => ex.id === f.id)
  );

  const schedulesToAdd = formSchedules.filter((f) => !f.id);

  schedulesToDelete.forEach((s) => deleteTechnicianSchedule(s.id));
  schedulesToUpdate.forEach((s) => {
    const updated = new TechnicianSchedule({
      id: s.id,
      technician_id: id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_active: true,
    });
    updateTechnicianSchedule(updated.id, updated);
  });

  const base = Date.now();
  schedulesToAdd.forEach((s, i) => {
    const newSchedule = new TechnicianSchedule({
      id: `TS${base}_${i}`,
      technician_id: id,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_active: true,
    });
    addTechnicianSchedule(newSchedule);
  });

  router.push("/layout-workshop/auto-repair-register/technicians");
}

function onCancel() {
  router.push("/layout-workshop/auto-repair-register/technicians");
}
</script>

<template>
  <div class="technician-form-container">
    <div class="form-header">
      <h1 class="page-title">
        {{ isEdit ? $t('manage-technicians.technician-form.edit-title') : $t('manage-technicians.technician-form.add-title') }}
      </h1>
    </div>

    <form @submit.prevent="onSubmit" class="technician-form">
      <div class="form-card">
        <!-- Technician Name Section -->
        <div class="form-section">
          <label class="form-label" for="technicianName">
            {{ $t('manage-technicians.technician-form.technician-name') }}
          </label>
          <input
              id="technicianName"
              type="text"
              class="form-input"
              v-model.trim="form.name"
              :placeholder="$t('manage-technicians.technician-form.name-placeholder')"
              required
          />
          <span v-if="!form.name" class="error-message">
            {{ $t('manage-technicians.technician-form.name-required') }}
          </span>
        </div>

        <div class="form-section">
          <label class="form-label" for="technicianLastName">
            {{ $t('manage-technicians.technician-form.technician-lastname') }}
          </label>
          <input
              id="technicianLastName"
              type="text"
              class="form-input"
              v-model.trim="form.last_name"
              :placeholder="$t('manage-technicians.technician-form.lastname-placeholder')"
              required
          />
          <span v-if="!form.last_name" class="error-message">
            {{ $t('manage-technicians.technician-form.lastname-required') }}
          </span>
        </div>

        <!-- Schedules Section -->
        <div class="schedules-section">
          <h2 class="section-title">{{ $t('manage-technicians.technician-form.schedules-title') }}</h2>

          <div v-for="(schedule, index) in form.schedules" :key="index" class="schedule-row">
            <div class="schedule-field">
              <label class="schedule-label">{{ $t('manage-technicians.technician-form.day') }}</label>
              <select v-model="schedule.day_of_week" class="form-select">
                <option
                    v-for="day in availableDays"
                    :key="day"
                    :value="day"
                >
                  {{ translateDay(day) }}
                </option>
              </select>
            </div>

            <div class="schedule-field">
              <label class="schedule-label">{{ $t('manage-technicians.technician-form.start-time') }}</label>
              <input
                  type="time"
                  v-model="schedule.start_time"
                  class="form-input-time"
              />
            </div>

            <div class="schedule-field">
              <label class="schedule-label">{{ $t('manage-technicians.technician-form.end-time') }}</label>
              <input
                  type="time"
                  v-model="schedule.end_time"
                  class="form-input-time"
              />
            </div>

            <button
                v-if="form.schedules.length > 1"
                type="button"
                class="remove-schedule-btn"
                @click="removeScheduleRow(index)"
                :title="$t('manage-technicians.technician-form.remove-schedule')"
            >
              ✕
            </button>
          </div>

          <button
              type="button"
              class="add-schedule-btn"
              @click="addScheduleRow"
          >
            {{ $t('manage-technicians.technician-form.add-schedule') }}
          </button>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
            type="button"
            class="cancel-btn"
            @click="onCancel"
        >
          {{ $t('manage-technicians.technician-form.cancel') }}
        </button>
        <button
            type="submit"
            class="submit-btn"
            :disabled="!form.name || !form.last_name"
        >
          {{ isEdit ? $t('manage-technicians.technician-form.update') : $t('manage-technicians.technician-form.create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.technician-form-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
}

.form-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-family: var(--font-bold);
  color: var(--color-primary);
  margin: 0;
}

.technician-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-card {
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 1rem;
  font-family: var(--font-semibold);
  color: var(--color-dark);
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: var(--font-regular);
  color: var(--color-dark);
  background-color: var(--color-light);
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input:invalid:not(:placeholder-shown) {
  border-color: #dc3545;
}

.error-message {
  font-size: 0.875rem;
  color: #dc3545;
  font-family: var(--font-regular);
  margin-top: 0.25rem;
}

/* Schedules Section */
.schedules-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-family: var(--font-bold);
  color: var(--color-dark);
  margin: 0 0 0.5rem 0;
}

.schedule-row {
  display: grid;
  grid-template-columns: 150px 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.schedule-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.schedule-label {
  font-size: 0.875rem;
  font-family: var(--font-medium);
  color: var(--color-dark);
}

.form-select {
  padding: 0.625rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: var(--font-regular);
  color: var(--color-dark);
  background-color: var(--color-light);
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input-time {
  padding: 0.625rem 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: var(--font-regular);
  color: var(--color-dark);
  background-color: var(--color-light);
  transition: border-color 0.2s ease;
}

.form-input-time:focus {
  outline: none;
  border-color: var(--color-primary);
}

.remove-schedule-btn {
  background-color: #dc3545;
  color: var(--color-light);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  line-height: 1;
}

.remove-schedule-btn:hover {
  background-color: #c82333;
}

.add-schedule-btn {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  border-radius: 25px;
  padding: 0.625rem 1.5rem;
  font-size: 0.9rem;
  font-family: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-start;
}

.add-schedule-btn:hover {
  background-color: #e6991a;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding-top: 1rem;
}

.cancel-btn,
.submit-btn {
  border: none;
  border-radius: 25px;
  padding: 0.875rem 2.5rem;
  font-size: 1rem;
  font-family: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 140px;
}

.cancel-btn {
  background-color: #6c757d;
  color: var(--color-light);
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.submit-btn {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
}

.submit-btn:hover:not(:disabled) {
  background-color: #e6991a;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .technician-form-container {
    padding: 1rem 0;
  }

  .page-title {
    font-size: 2rem;
    text-align: center;
  }

  .form-card {
    padding: 1.5rem;
  }

  .schedule-row {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .remove-schedule-btn {
    justify-self: center;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .technician-form-container {
    padding: 0.5rem 0;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .form-input,
  .form-select,
  .form-input-time {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  .cancel-btn,
  .submit-btn {
    padding: 0.75rem 2rem;
    font-size: 0.9rem;
  }
}
</style>