<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import useAutoRepairRegisterStore from "@/auto-repair-register/application/auto-repair.store.js";
import { useI18n } from 'vue-i18n';

// Props

const { technician, technicianSchedules } = defineProps({
  technician: { type: Object, required: true },
  technicianSchedules: { type: Array, required: true }
});
// Stores
const registerStore = useAutoRepairRegisterStore();
const router = useRouter();



// i18n
const { locale, t } = useI18n();

// Reactive current language
const currentLang = ref(locale.value);

// Days order for sorting
const daysOrder = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7
};

// Days map for translation
const buildDaysMap = () => ({
  Monday: t('manage-technicians.technician-card.monday'),
  Tuesday: t('manage-technicians.technician-card.tuesday'),
  Wednesday: t('manage-technicians.technician-card.wednesday'),
  Thursday: t('manage-technicians.technician-card.thursday'),
  Friday: t('manage-technicians.technician-card.friday'),
  Saturday: t('manage-technicians.technician-card.saturday'),
  Sunday: t('manage-technicians.technician-card.sunday')
});

const daysMap = ref(buildDaysMap());

// Watch language change
watch(locale, (newLang) => {
  currentLang.value = newLang;
  daysMap.value = buildDaysMap();
});

// Sorted schedules
const sortedSchedules = computed(() => {
  const schedules = technicianSchedules || [];
  return [...schedules].sort((a, b) => {
    const orderA = daysOrder[a.day_of_week] ?? 999;
    const orderB = daysOrder[b.day_of_week] ?? 999;
    return orderA - orderB;
  });
});

// Translate day
const translateDay = (day) => {
  return computed(() => {
    return currentLang.value === 'es' ? daysMap.value[day] ?? day : day;
  });
};

// Navigation
const editTechnician = (id) => {
  router.push({ path: `/layout-workshop/auto-repair-register/technicians/edit/${id}` });
};

// Delete technician
const deleteTechnician = (id) => {
  registerStore.deleteTechnicianSchedule(id);
};
onMounted(async () => {
  registerStore.fetchTechnicians()
  registerStore.fetchTechnicianSchedule()
})
</script>

<template>
  <div class="technician-card">
    <div class="technician-info">
      <h3 class="technician-name">
        {{ technician.name }} {{ technician.last_name }}
      </h3>

      <!-- Si no hay schedules -->
      <p v-if="!sortedSchedules || sortedSchedules.length === 0" class="no-schedules-message">
        {{ t('manage-technicians.technician-card.no-schedules-message') }}
      </p>

      <!-- Lista de schedules -->
      <div v-else class="schedule-list">
        <div
            v-for="schedule in sortedSchedules || []"
            :key="schedule.id"
            v-if="schedule.is_active"
            class="schedule-item"
        >
          <span class="schedule-day">{{ translateDay(schedule.day_of_week).value }}</span>
          <span class="schedule-time">
            {{ schedule.start_time.split(':').slice(0,2).join(':') }} -
            {{ schedule.end_time.split(':').slice(0,2).join(':') }}
          </span>
        </div>
      </div>
    </div>

    <div class="technician-actions">
      <button
          class="edit-button"
          type="button"
          @click="editTechnician(technician.id)"
      >
        {{ t('manage-technicians.technician-card.edit-button') }}
      </button>
      <button
          class="delete-button"
          type="button"
          @click="deleteTechnician(technician.id)"
      >
        {{ t('manage-technicians.technician-card.delete-button') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.technician-card {
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
  gap: 2rem;
}

.technician-card:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.technician-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.technician-name {
  font-size: 1.25rem;
  font-family: var(--font-bold);
  color: var(--color-dark);
  margin: 0;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.schedule-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 2rem;
  font-size: 1rem;
  font-family: var(--font-regular);
  color: var(--color-dark);
}

.schedule-day {
  font-weight: 500;
}

.schedule-time {
  font-weight: 400;
}

.technician-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 120px;
}

.edit-button,
.delete-button {
  border: none;
  border-radius: 25px;
  padding: 0.625rem 1.5rem;
  font-size: 1rem;
  font-family: var(--font-medium);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
}

.edit-button {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
}

.edit-button:hover {
  background-color: #e6991a;
}

.delete-button {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
}

.delete-button:hover {
  background-color: #e6991a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .technician-card {
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
    text-align: center;
  }

  .schedule-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
    text-align: left;
  }

  .technician-actions {
    width: 100%;
    min-width: unset;
  }
}

@media (max-width: 480px) {
  .technician-card {
    padding: 1rem;
    gap: 1rem;
  }

  .technician-name {
    font-size: 1.1rem;
  }

  .schedule-item {
    font-size: 0.9rem;
  }

  .edit-button,
  .delete-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>