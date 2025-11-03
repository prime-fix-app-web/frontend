<template>
  <div class="page">
    <header class="main-header"><h1>{{ $t('track-vehicle.title') }}</h1></header>

    <label>Vehículo</label>
    <select v-model="selectedId" class="input">
      <option v-for="v in store.myVehicles" :key="v.id" :value="v.id">{{ v.plate }} - {{ v.brand }} {{ v.model }}</option>
    </select>

    <div v-if="selectedId" class="progress">
      <div v-for="(s,i) in steps" :key="s" class="step" :class="{active: i<=activeIndex}">{{ s }}</div>
    </div>

    <div v-if="selectedId && !currentStatus" class="empty">Este coche no está siendo reparado</div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import useOwnerStore from '@/owner/application/owner.store.js'

const store = useOwnerStore()
const selectedId = ref('')

onMounted(async () => {
  await Promise.all([
    store.fetchVehicles(),
    store.fetchVisits()
  ])
  if (store.myVehicles.length) selectedId.value = store.myVehicles[0].id
})

const currentStatus = computed(() => {
  if (!selectedId.value) return ''
  const visits = store.visitsByVehicle(selectedId.value)
  if (!visits.length) return ''
  return visits[visits.length - 1].status || ''
})

const steps = ['En espera','En diagnóstico','En reparación','En prueba','Listo para recoger','Recogido']
const activeIndex = computed(() => Math.max(0, steps.findIndex(s => s === currentStatus.value)))
</script>

<style scoped>
.page{padding:0 1rem}
.input{height:36px;border:1px solid #c8d1d6;border-radius:6px;padding:0 10px}
.progress{display:flex;gap:8px;margin-top:16px;flex-wrap:wrap}
.step{padding:6px 10px;border-radius:12px;background:#eee;color:#333;font-size:.9rem}
.step.active{background:var(--color-first-complementary);color:#111}
.empty{margin-top:12px;color:#666}
</style>
