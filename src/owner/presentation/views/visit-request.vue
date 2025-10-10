<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useOwnerStore from '@/owner/application/owner.store.js'
import useIamStore from '@/iam/application/iam.store.js'

const route = useRoute()
const router = useRouter()
const store = useOwnerStore()
const iam = useIamStore()

const form = ref({ vehicleId: '', failure: '', date: '' })
const submitting = ref(false)

onMounted(async () => {
  await Promise.all([
    store.fetchVehicles(),
    store.fetchVisits()
  ])
  const my = store.myVehicles
  if (my.length) form.value.vehicleId = my[0].id
})

async function submit() {
  submitting.value = true
  try {
    await store.requestVisit({
      autoRepairId: route.params.id,
      vehicleId: form.value.vehicleId,
      failure: form.value.failure,
      timeVisit: form.value.date
    })
    router.push('/layout-owner/history')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <header class="main-header"><h1>Solicitar visita</h1></header>

    <div class="form">
      <label>Vehículo</label>
      <select v-model="form.vehicleId" class="input">
        <option v-for="v in store.myVehicles" :key="v.id" :value="v.id">{{ v.plate }} - {{ v.brand }} {{ v.model }}</option>
      </select>

      <label>Fecha y hora</label>
      <input type="datetime-local" v-model="form.date" class="input" />

      <label>Describe la falla</label>
      <textarea v-model="form.failure" class="textarea" rows="4" />

      <button class="btn-primary" :disabled="submitting || !form.vehicleId || !form.date || !form.failure" @click="submit">
        {{ submitting ? 'Enviando…' : 'Confirmar solicitud' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.page{padding:0 1rem}
/* Encabezado consistente */
.main-header{margin-bottom:2rem}
.main-header h1{font-size:2.5rem;font-family:var(--font-bold), sans-serif;color:var(--color-primary);margin:0;position:relative;padding-bottom:1rem}
.main-header h1::after{content:'';position:absolute;bottom:0;left:0;width:200px;height:4px;background-color:var(--color-primary)}

.form{max-width:600px;display:flex;flex-direction:column;gap:12px}
.input{height:36px;border:1px solid #c8d1d6;border-radius:6px;padding:0 10px;color:var(--color-dark);background:#fff}
.textarea{border:1px solid #c8d1d6;border-radius:6px;padding:10px;color:var(--color-dark);background:#fff}
/* Colores de opciones en selects */
select.input option{color:var(--color-dark)}
/* Placeholder accesible */
.input::placeholder,.textarea::placeholder{color:#6a6f73}
/* Estados */
.input:disabled,.textarea:disabled{color:#8a8f94;background:#f3f5f7}
.input:focus,.textarea:focus{outline:none;border-color:var(--color-tertiary-complementary);box-shadow:0 0 0 2px rgba(100,145,164,.15)}
.btn-primary{margin-top:12px;background:var(--color-first-complementary);border:none;border-radius:999px;padding:.6rem 1.4rem;cursor:pointer;color:var(--color-dark)}
/* Estado disabled con buen contraste */
.btn-primary:disabled, .btn-primary[disabled]{
  opacity: 1;              /* evita que el navegador baje la opacidad del texto */
  cursor: not-allowed;
  background-color: #f6c557; /* tono más claro, pero mantiene contraste */
  color: var(--color-dark);  /* texto oscuro siempre legible */
}
</style>
