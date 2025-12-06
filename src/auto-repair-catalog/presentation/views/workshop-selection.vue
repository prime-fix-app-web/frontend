<script setup>
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useOwnerStore from '@/auto-repair-catalog/application/owner.store.js'
import useIamStore from '@/iam/application/iam.store.js'

const route = useRoute()
const router = useRouter()
const store = useOwnerStore()
const iam = useIamStore()

onMounted(async () => {
  // Sync filters from query params and load required data
  const dep = route.query.department?.toString() || ''
  const dist = route.query.district?.toString() || ''
  if (dep) store.selectedDepartment = dep
  if (dist) store.selectedDistrict = dist
  store.ensureLookupsLoaded()
  await store.fetchAutoRepairs()
})

const isLoading = computed(() => !iam.locationsLoaded || store.loading)
const totalResults = computed(() => store.filteredAutoRepairs.length)

// Suggested districts in the same department that currently have workshops
const suggestedDistricts = computed(() => {
  if (!store.selectedDepartment) return []
  // Build sets of location keys from workshops: by location_id (foreign key)
  const codeKeys = new Set(store.autoRepairs.map(ar => String(ar.locationId || '').trim()).filter(Boolean))
  const pkKeys = new Set(store.autoRepairs.map(ar => String(ar.locationPk || '').trim()).filter(Boolean))
  const dists = new Set(
    (iam.locations || [])
      .filter(l => l.department === store.selectedDepartment && (
        (l.id && codeKeys.has(String(l.id).trim())) || (l.pk && pkKeys.has(String(l.pk).trim()))
      ))
      .map(l => l.district)
  )
  // Exclude the currently selected district if it has 0 results
  dists.delete(store.selectedDistrict)
  return Array.from(dists)
})

function goRequest(id) {
  router.push({ name: 'auto-repair-catalog-visit-request', params: { id } })
}
</script>

<template>
  <div class="selection">
    <header class="main-header">
      <h1>Buscar taller</h1>
      <p class="subtitle">Selección de taller</p>
    </header>

    <div v-if="!store.selectedDepartment || !store.selectedDistrict" class="empty">
      Selecciona primero un departamento y distrito.
    </div>

    <div v-else-if="isLoading" class="empty">Cargando talleres…</div>

    <template v-else>
      <p class="results" v-if="totalResults > 0">{{ totalResults }} taller(es) encontrado(s)</p>

      <ul v-if="totalResults" class="cards">
        <li v-for="item in store.filteredAutoRepairs" :key="item.id" class="card">
          <div class="card-header">
            <svg class="icon"><use href="/assets/icons/sprite.symbol.svg#tool" /></svg>
            <span>Taller {{ item.id }}</span>
          </div>
          <div class="card-body">
            <p>
              <strong>Dirección:</strong>
              <span v-if="store.getLocationInfo(item.locationId || item.locationPk)">
                {{ store.getLocationInfo(item.locationId || item.locationPk)?.address }},
                {{ store.getLocationInfo(item.locationId || item.locationPk)?.district }} -
                {{ store.getLocationInfo(item.locationId || item.locationPk)?.department }}
              </span>
              <span v-else>Sin dirección</span>
            </p>
            <div class="card-actions">
              <button class="btn-primary" @click="goRequest(item.id)">Seleccionar taller</button>
            </div>
          </div>
        </li>
      </ul>

      <div v-else class="empty">
        No hay talleres para esta ubicación.
        <template v-if="suggestedDistricts.length">
          <br />
          Prueba con: {{ suggestedDistricts.join(', ') }}.
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped>
.selection { padding: 0 1rem; }
.main-header { margin-bottom: 1rem; }
.main-header h1 { font-size: 2.5rem; font-family: var(--font-bold), sans-serif; color: var(--color-primary); margin: 0; }
.subtitle{ color:#555; margin:.25rem 0 0 }
.results{ color:#333; margin:.25rem 0 1rem; font-family: var(--font-medium), sans-serif; }
.cards { list-style: none; padding: 0; margin: 1rem 0; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.card { background: var(--color-second-complementary); border-radius: 12px; padding: 1rem; }
.card-header { display: flex; align-items: center; gap: .5rem; justify-content: space-between; font-family: var(--font-semibold), sans-serif; color: var(--color-primary); }
.icon { width: 18px; height: 18px; fill: currentColor; }
.card-body { color: var(--color-dark); font-family: var(--font-regular), sans-serif; }
.card-actions { margin-top: .75rem }
.btn-primary { background-color: var(--color-first-complementary); color: var(--color-dark); border: none; border-radius: 999px; padding: 0.6rem 1.4rem; cursor: pointer; }
.empty { color: #666; font-family: var(--font-regular), sans-serif; margin-top: 1rem; }
</style>
