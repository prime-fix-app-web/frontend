<template>
  <div class="page">
    <header class="main-header"><h1>Historial</h1></header>

    <table class="table" v-if="myVisits.length">
      <thead><tr><th>Taller</th><th>Vehículo</th><th>Fecha</th><th>Estado</th></tr></thead>
      <tbody>
        <tr v-for="v in myVisits" :key="v.id_visit">
          <td>{{ workshopName(v.id_auto_repair) }}</td>
          <td>{{ store.vehicles.find(x=>x.id===v.id_vehicle)?.plate || v.id_vehicle }}</td>
          <td>{{ v.time_visit }}</td>
          <td>{{ v.status }}</td>
        </tr>
      </tbody>
    </table>
    <div v-else class="empty">No tienes visitas.</div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import useOwnerStore from '@/owner/application/owner.store.js'

const store = useOwnerStore()

onMounted(async () => {
  await Promise.all([
    store.fetchVehicles(),
    store.fetchVisits(),
    store.fetchAutoRepairs()
  ])
})

const myVisits = computed(() => {
  const myIds = new Set(store.myVehicles.map(v => v.id))
  return store.visits.filter(v => myIds.has(v.id_vehicle))
})

function workshopName(id) { return `Taller ${id}` }
</script>

<style scoped>
.page{padding:0 1rem}
.table{width:100%;border-collapse:collapse}
th,td{border-bottom:1px solid #eee;padding:.5rem;text-align:left}
.empty{color:#666}
</style>
