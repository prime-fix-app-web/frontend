<script setup>
import {onMounted, reactive, ref} from 'vue';
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";

const trackingStore = useTrackingStore();
const { fetchNotifications, notificationsLoaded } = trackingStore;

const departments = [
  'Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Piura', 'Chiclayo', 'Huancayo', 'Tacna'
];
const districts = [
  'San Miguel', 'Miraflores', 'San Isidro', 'Barranco', 'Surco', 'La Molina', 'Pueblo Libre', 'Jesús María'
];

const searchForm = reactive({
  department: '',
  district: ''
});

const touched = reactive({
  department: false,
  district: false
});

function onSearch() {
  touched.department = true;
  touched.district = true;
  if (!searchForm.department || !searchForm.district) return;
  console.log('Búsqueda de taller:', { ...searchForm });
  // Add search logic here
}

onMounted(() => {
  if (!notificationsLoaded) fetchNotifications();
})

</script>

<template>
  <div class="search-workshop-container">
    <div class="search-content">
      <h1 class="search-title">{{ $t('home-owner.searchWorkshop') }}</h1>
      <form @submit.prevent="onSearch" class="search-form">
        <div class="form-group">
          <label for="department" class="form-label">{{ $t('home-owner.selectDepartment') }}</label>
          <select
              id="department"
              v-model="searchForm.department"
              class="form-select"
              :class="{ 'is-invalid': touched.department && !searchForm.department }"
          >
            <option value="" disabled>{{ $t('home-owner.selectDepartment') }}</option>
            <option v-for="dep in departments" :key="dep" :value="dep">{{ dep }}</option>
          </select>
          <span v-if="touched.department && !searchForm.department" class="error-message">
            {{ $t('home-owner.departmentRequired') }}
          </span>
        </div>
        <div class="form-group">
          <label for="district" class="form-label">{{ $t('home-owner.selectDistrict') }}</label>
          <select
              id="district"
              v-model="searchForm.district"
              class="form-select"
              :class="{ 'is-invalid': touched.district && !searchForm.district }"
          >
            <option value="" disabled>{{ $t('home-owner.selectDistrict') }}</option>
            <option v-for="dist in districts" :key="dist" :value="dist">{{ dist }}</option>
          </select>
          <span v-if="touched.district && !searchForm.district" class="error-message">
            {{ $t('home-owner.districtRequired') }}
          </span>
        </div>
        <button
            type="submit"
            class="search-button"
            :disabled="!searchForm.department || !searchForm.district"
        >
          {{ $t('home-owner.searchWorkshop') }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.search-workshop-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.search-content {
  background: var(--color-light);
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-title {
  font-family: var(--font-bold);
  font-size: 2.5rem;
  color: var(--color-primary);
  text-align: center;
  margin: 0 0 3rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 1rem;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-family: var(--font-semibold);
  font-size: 1.1rem;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.form-select {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 1rem;
  font-family: var(--font-regular);
  background: var(--color-light);
  color: var(--color-dark);
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 50px;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
}

.form-select:hover {
  border-color: var(--color-primary);
}

.form-select option {
  padding: 0.75rem;
  font-family: var(--font-regular);
}

.form-select option:disabled {
  color: #9ca3af;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  font-family: var(--font-medium);
  margin-top: 0.25rem;
}

.search-button {
  width: 100%;
  padding: 1.25rem 2rem;
  margin-top: 1rem;
  border: none;
  border-radius: 12px;
  background: var(--color-first-complementary);
  color: var(--color-dark);
  font-family: var(--font-bold);
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 56px;
}

.search-button:hover:not(:disabled) {
  background: #ffb700;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
}

.search-button:active:not(:disabled) {
  transform: translateY(0);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .search-workshop-container {
    padding: 1rem;
  }

  .search-content {
    padding: 2rem 1.5rem;
  }

  .search-title {
    font-size: 2rem;
    margin-bottom: 2rem;
  }

  .search-form {
    gap: 1.5rem;
  }

  .form-label {
    font-size: 1rem;
  }

  .form-select {
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }

  .search-button {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }
}

/* Focus and Accessibility */
.form-select:focus-visible,
.search-button:focus-visible {
  outline: 2px solid var(--color-first-complementary);
  outline-offset: 2px;
}

</style>