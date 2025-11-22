<script setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import useOwnerStore from '@/auto-repair-catalog/application/owner.store.js'
import { useRouter } from 'vue-router'

const { t } = useI18n({ useScope: 'global' })
const store = useOwnerStore()
const router = useRouter()

onMounted(() => {
  store.ensureLookupsLoaded()
  if (!store.selectedDepartment && store.departments.length) store.preselectDefaults()
})

const canSearch = computed(() => !!store.selectedDepartment && !!store.selectedDistrict)

function goSearch() {
  if (!canSearch.value) return
  router.push({
    name: 'auto-repair-catalog-workshop-selection',
    query: {
      department: store.selectedDepartment,
      district: store.selectedDistrict,
    }
  })
}
</script>

<template>
  <div class="search-workshop">
    <header class="main-header">
      <h1>{{ t('home-auto-repair-catalog.searchWorkshop') }}</h1>
    </header>

    <section class="form-section">
      <div class="form-grid">
        <div class="form-field">
          <label>{{ t('home-auto-repair-catalog.selectDepartment') }}</label>
          <select v-model="store.selectedDepartment" class="input">
            <option v-for="dep in store.departments" :key="dep" :value="dep">{{ dep }}</option>
          </select>
        </div>

        <div class="form-field">
          <label>{{ t('home-auto-repair-catalog.selectDistrict') }}</label>
          <select v-model="store.selectedDistrict" class="input" :disabled="!store.selectedDepartment">
            <option v-for="dist in store.districts" :key="dist" :value="dist">{{ dist }}</option>
          </select>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" :disabled="!canSearch" @click="goSearch">{{ t('home-auto-repair-catalog.searchWorkshop') }}</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.search-workshop { padding: 0 1rem; }

/* Encabezado con estilo del layout */
.main-header { margin-bottom: 2rem; }
.main-header h1 {
  font-size: 2.5rem;
  font-family: var(--font-bold), sans-serif;
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

.form-section { margin-top: 1rem; }
.form-grid { max-width: 600px; display: grid; gap: 1.25rem; }
.form-field { display: flex; flex-direction: column; gap: 0.5rem; }
label { font-family: var(--font-medium), sans-serif; color: #333; }
.input {
  width: 100%;
  height: 36px;
  border: 1px solid #c8d1d6;
  border-radius: 6px;
  background: #fff;
  padding: 0 0.75rem;
  font-family: var(--font-sans), sans-serif;
  color: var(--color-dark); /* Asegura contraste de texto en inputs/selects */
}
/* Forzar color en opciones del select (soporte amplio en navegadores modernos) */
select.input option { color: var(--color-dark); }
/* Estados accesibles */
select.input:disabled { color: #8a8f94; background-color: #f3f5f7; }
.input:focus { outline: none; border-color: var(--color-tertiary-complementary); box-shadow: 0 0 0 2px rgba(100,145,164,.15); }

.actions { margin-top: 1.5rem; }
.btn-primary {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  border-radius: 999px;
  padding: 0.6rem 1.4rem;
  font-family: var(--font-medium), sans-serif;
  cursor: pointer;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { background-color: #e6991a; }
</style>
