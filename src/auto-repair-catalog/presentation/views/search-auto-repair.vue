<script setup>
import {ref, reactive, computed, watch, onMounted} from 'vue'
import { useRouter } from 'vue-router'
import SelectAutoRepair from "@/auto-repair-catalog/presentation/components/select-auto-repair.vue";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import useIamStore from "@/iam/application/iam.store.js";

const router = useRouter()
const catalogStore = useCatalogStore()
const iamStore = useIamStore()

const showResults = ref(false)
const selectedDepartment = ref('')

const loading = computed(() => catalogStore.loading)
const error = computed(() => catalogStore.error)

const searchForm = reactive({
  department: '',
  district: ''
})

onMounted(async ()=>{
  catalogStore.fetchLocations();
  catalogStore.fetchAutoRepairs();
  iamStore.fetchUserAccounts();
  iamStore.fetchUsers();
})

watch(() => searchForm.department, (value) => {
  selectedDepartment.value = value || ''
  searchForm.district = ''
})

const filteredAutoRepairs = computed(() => {
  const { department, district } = searchForm
  const { autoRepairs, locations } = catalogStore
  const { userAccounts, users } = iamStore

  if (!showResults.value || !department || !district) {
    return []
  }

  const mappedAutoRepairs = autoRepairs
      .map(autoRepair => {
        const userAccount = userAccounts.find(ua => ua.id === autoRepair.id_user_account)
        if (!userAccount) return null

        const user = users.find(u => u.id === userAccount.id_user)
        if (!user) return null

        const location = locations.find(loc => loc.id_location === user.id_location)
        if (!location) return null

        return { autoRepair, location }
      })
      .filter(Boolean)

  autoRepairs.forEach(autoRepair => {
    const userAccount = userAccounts.find(ua => ua.id === autoRepair.id_user_account)
    const user = userAccount ? users.find(u => u.id === userAccount.id_user) : null
    const location = user ? locations.find(l => l.id === user.id_location) : null
  })

  return mappedAutoRepairs.filter(item => {
    return (
        item.location.department.trim().toLowerCase() === department.trim().toLowerCase() &&
        item.location.district.trim().toLowerCase() === district.trim().toLowerCase()
    )
  })
})

const departments = computed(() => {
  const locations = catalogStore.locations
  const fromBackend = [...new Set(locations.map(l => l.department))]
  const defaults = ['Lima']
  return [...new Set([...defaults, ...fromBackend])].sort()
})

const districts = computed(() => {
  const locations = catalogStore.locations
  const department = selectedDepartment.value

  if (!department) return []

  const limaDefaults = [
    'San Miguel', 'Miraflores', 'San Isidro', 'Surco', 'La Molina',
    'Barranco', 'Pueblo Libre', 'Jesús María', 'Lince', 'Los Olivos',
    'Cercado de Lima', 'Santiago de Surco', 'Surquillo'
  ]

  const fromBackend = [
    ...new Set(
        locations
            .filter(loc => loc.department === department)
            .map(loc => loc.district)
    )
  ]

  return department === 'Lima'
      ? [...new Set([...limaDefaults, ...fromBackend])].sort()
      : fromBackend.sort()
})

function onSearch() {
  if (!searchForm.department || !searchForm.district) return
  showResults.value = true
}

function onBack() {
  showResults.value = false
  searchForm.department = ''
  searchForm.district = ''
}
</script>

<template>
  <div v-if="!showResults" class="search-workshop-container">
    <div class="search-content">
      <h1 class="search-title">Buscar taller automotriz</h1>

      <form class="search-form" @submit.prevent="onSearch">
        <div class="form-group">
          <label for="department" class="form-label">Departamento</label>
          <select v-model="searchForm.department" id="department" class="form-select">
            <option disabled value="">Selecciona un departamento</option>
            <option v-for="dep in departments" :key="dep" :value="dep">{{ dep }}</option>
          </select>
          <span v-if="!searchForm.department" class="error-message">
            Debes seleccionar un departamento.
          </span>
        </div>

        <div class="form-group">
          <label for="district" class="form-label">Distrito</label>
          <select
              v-model="searchForm.district"
              id="district"
              class="form-select"
              :disabled="!searchForm.department"
          >
            <option disabled value="">Selecciona un distrito</option>
            <option v-for="dist in districts" :key="dist" :value="dist">{{ dist }}</option>
          </select>
          <span v-if="!searchForm.district && searchForm.department" class="error-message">
            Debes seleccionar un distrito.
          </span>
        </div>

        <button type="submit" class="search-button" :disabled="!searchForm.department || !searchForm.district || loading">
          {{ loading ? 'Buscando...' : 'Buscar' }}
        </button>
      </form>

      <div v-if="error" class="error-alert">{{ error }}</div>
    </div>
  </div>

  <div v-else class="results-workshop-container">
    <div class="results-content">
      <h1 class="search-title">Selecciona un taller</h1>

      <div v-if="loading" class="loading-message">Cargando talleres...</div>
      <div v-if="error" class="error-alert">{{ error }}</div>

      <div v-if="!loading && filteredAutoRepairs.length === 0" class="no-results">
        <p>No se encontraron talleres en esta ubicación.</p>
        <button type="button" class="back-button" @click="onBack">Buscar nuevamente</button>
      </div>

      <div v-if="filteredAutoRepairs.length > 0" class="workshops-list">
        <SelectAutoRepair
            v-for="item in filteredAutoRepairs"
            :key="item.autoRepair.id_auto_repair"
            :auto-repair="item.autoRepair"
            :location="item.location"
        />
        <div class="back-button-container">
          <button type="button" class="back-button" @click="onBack">Buscar nuevamente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Primera parte: Formulario de búsqueda */
.search-workshop-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
  min-height: 600px;
}

.search-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2.5rem 3rem;
  max-width: 600px;
  width: 100%;
}

.search-title {
  font-family: var(--font-bold);
  font-size: 2.5rem;
  color: var(--color-primary);
  margin: 0 0 2rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 3px solid var(--color-first-complementary);
}

/* Formulario */
.search-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-semibold);
  font-size: 1rem;
  color: var(--color-primary);
}

.form-select {
  font-family: var(--font-regular);
  font-size: 1rem;
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-tertiary-complementary);
  border-radius: 8px;
  background-color: white;
  color: var(--color-dark);
  transition: all 0.3s ease;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(17, 67, 88, 0.1);
}

.form-select:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-select:invalid {
  border-color: #e0e0e0;
}

.error-message {
  font-family: var(--font-regular);
  font-size: 0.875rem;
  color: #dc3545;
  margin-top: 0.25rem;
}

.search-button {
  font-family: var(--font-semibold);
  font-size: 1.1rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--color-first-complementary);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.search-button:hover:not(:disabled) {
  background-color: #d99a1a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.search-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* Segunda parte: Resultados */
.results-workshop-container {
  padding: 2rem 1rem;
}

.results-content {
  max-width: 900px;
  margin: 0 auto;
}

.workshops-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.back-button-container {
  display: flex;
  justify-content: center;
  margin-top: 2.5rem;
}

.back-button {
  font-family: var(--font-semibold);
  font-size: 1rem;
  padding: 0.875rem 2.5rem;
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  background-color: white;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 67, 88, 0.3);
}

/* Mensajes de estado */
.loading-message {
  font-family: var(--font-regular);
  font-size: 1.1rem;
  text-align: center;
  padding: 2rem;
  color: var(--color-primary);
  background-color: rgba(100, 145, 164, 0.1);
  border-radius: 8px;
  margin-top: 2rem;
}

.error-alert {
  font-family: var(--font-regular);
  font-size: 1rem;
  text-align: center;
  padding: 1rem;
  color: #dc3545;
  background-color: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  margin-top: 1rem;
}

.no-results {
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  margin-top: 2rem;
}

.no-results p {
  font-family: var(--font-medium);
  font-size: 1.2rem;
  color: var(--color-dark);
  margin: 0 0 1.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .search-content {
    padding: 2rem 1.5rem;
  }

  .search-title {
    font-size: 1.75rem;
  }

  .search-button,
  .back-button {
    font-size: 1rem;
  }

  .workshops-list {
    gap: 1.25rem;
  }
}

@media (max-width: 480px) {
  .search-workshop-container,
  .results-workshop-container {
    padding: 1rem 0.5rem;
  }

  .search-content {
    padding: 1.5rem 1rem;
  }

  .search-title {
    font-size: 1.5rem;
  }
}
</style>