<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useOwnerStore from '@/owner/application/owner.store.js'

const route = useRoute()
const router = useRouter()
const store = useOwnerStore()

onMounted(async () => {
  // Sincroniza los filtros desde query y carga datos necesarios
  const dep = route.query.department?.toString() || ''
  const dist = route.query.district?.toString() || ''
  if (dep) store.selectedDepartment = dep
  if (dist) store.selectedDistrict = dist
  store.ensureLookupsLoaded()
  await Promise.all([
    store.fetchAutoRepairs(),
    store.fetchRatings(),
  ])
})

function goRequest(id) {
  router.push({ name: 'owner-visit-request', params: { id } })
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

    <ul v-else-if="store.filteredAutoRepairs.length" class="cards">
      <li v-for="item in store.filteredAutoRepairs" :key="item.id" class="card">
        <div class="card-header">
          <svg class="icon"><use href="/assets/icons/sprite.symbol.svg#tool" /></svg>
          <span>Taller {{ item.id }}</span>
          <span class="rating">{{ store.getAverageRating(item.id).toFixed(1) }} / 5 ⭐</span>
        </div>
        <div class="card-body">
          <p>
            <strong>Dirección:</strong>
            <span v-if="store.getLocationInfo(item.locationId)">
              {{ store.getLocationInfo(item.locationId)?.address }},
              {{ store.getLocationInfo(item.locationId)?.district }} -
              {{ store.getLocationInfo(item.locationId)?.department }}
            </span>
            <span v-else>Sin dirección</span>
          </p>
          <div class="card-actions">
            <button class="btn-primary" @click="goRequest(item.id)">Seleccionar taller</button>
          </div>
        </div>
      </li>
    </ul>

    <div v-else class="empty">No hay talleres para esta ubicación.</div>
  </div>
</template>

<style scoped>
.selection { padding: 0 1rem; }
.main-header { margin-bottom: 1rem; }
.main-header h1 { font-size: 2.5rem; font-family: var(--font-bold), sans-serif; color: var(--color-primary); margin: 0; }
.subtitle{ color:#555; margin:.25rem 0 0 }
.cards { list-style: none; padding: 0; margin: 1rem 0; display: grid; gap: 1rem; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
.card { background: var(--color-second-complementary); border-radius: 12px; padding: 1rem; }
.card-header { display: flex; align-items: center; gap: .5rem; justify-content: space-between; font-family: var(--font-semibold), sans-serif; color: var(--color-primary); }
.icon { width: 18px; height: 18px; fill: currentColor; }
.card-body { color: var(--color-dark); font-family: var(--font-regular), sans-serif; }
.card-actions { margin-top: .75rem }
.btn-primary { background-color: var(--color-first-complementary); color: var(--color-dark); border: none; border-radius: 999px; padding: 0.6rem 1.4rem; cursor: pointer; }
.empty { color: #666; font-family: var(--font-regular), sans-serif; margin-top: 1rem; }
.rating{ font-size:.9rem; color: var(--color-dark) }
</style>
