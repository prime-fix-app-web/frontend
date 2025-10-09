<script setup>
import { useAutoRepairRegisterStore } from '@/autorepair-registration/application/auto-repair.store.js';
import LayoutOwner from "@/shared/presentation/components/layout-owner.vue"
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  technician: {
    type: Object,
    default: undefined
  }
})

// Router y Stores
const router = useRouter()
const autoRepairStore = useAutoRepairRegisterStore();

// Reactive form state
const form = ref({
  name: '',
  age: 0,
  id_user_account: '',
  id_auto_repair: ''
})

// UI state
const isSubmitting = ref(false)
const errorsForm = ref({
  name: null,
  age: null,
  id_user_account: null,
  id_auto_repair: null
})

// Computed property for selected auto-repair
const selectedAutoRepair = computed(() => {
  const ar = autoRepairStore.getAutoRepairRegisterById(form.value.id_auto_repair)
  return ar?.RUC ?? ''
})

// Watch for prop changes to populate form
watch(
    () => props.technician,
    (newValue) => {
      if (newValue) {
        form.value.name = newValue.name ?? ''
        form.value.age = newValue.age ?? 0
        form.value.id_user_account = newValue.id_user_account ?? ''
        form.value.id_auto_repair = newValue.id_auto_repair ?? ''
      }
    },
    { immediate: true }
)

// Validaciones simples
function validateName(name) {
  if (!name) return { required: true }
  if (name.length < 2) return { minLength: true }
  return null
}
function validateAge(age) {
  if (!age || age <= 0) return { required: true }
  if (age < 18 || age > 100) return { invalid: true }
  return null
}
function validateUserAccount(account) {
  if (!account) return { required: true }
  return null
}
function validateAutoRepair(repair) {
  if (!repair) return { required: true }
  return null
}

// Validación global
const isFormValid = computed(() => {
  return (
      form.value.name.length >= 2 &&
      form.value.age >= 18 &&
      form.value.age <= 100 &&
      form.value.id_user_account &&
      form.value.id_auto_repair
  )
})

async function submit() {
  // Reset de errores
  errorsForm.value = {
    name: null,
    age: null,
    id_user_account: null,
    id_auto_repair: null
  }

  // Validaciones
  const nameError = validateName(form.value.name)
  const ageError = validateAge(form.value.age)
  const userError = validateUserAccount(form.value.id_user_account)
  const repairError = validateAutoRepair(form.value.id_auto_repair)

  if (nameError || ageError || userError || repairError) {
    errorsForm.value.name = nameError
    errorsForm.value.age = ageError
    errorsForm.value.id_user_account = userError
    errorsForm.value.id_auto_repair = repairError
    return
  }

  isSubmitting.value = true

  const id_technician =
      props.technician?.id_technician ??
      'TECH' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')

  const technician = {
    id_technician,
    name: form.value.name,
    age: form.value.age,
    id_user_account: form.value.id_user_account,
    id_auto_repair: form.value.id_auto_repair
  }

  try {
    if (props.technician) {
      await autoRepairStore.updateTechnician(technician)
      alert('Técnico actualizado correctamente.')
    } else {
      await autoRepairStore.addTechnician(technician)
      alert('Técnico creado correctamente.')
    }
    router.push('/technicians')
  } catch (error) {
    console.error('Error al procesar técnico:', error)
    alert('Error: ' + (error.message || error))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>

  <div class="technician-details-container">
    <h1 class="page-title">{{ props.technician ? 'Editar' : 'Agregar' }} Técnico</h1>

    <div class="form-container">
      <form class="technician-form" @submit.prevent="submit">
        <div class="form-group">
          <label for="nombre-tecnico">Nombre del técnico *</label>
          <input
              type="text"
              id="nombre-tecnico"
              placeholder="Jesús Grimaldo"
              v-model="form.name"
              required
          />
          <small v-if="errorsForm.name?.required" class="error">El nombre es obligatorio.</small>
          <small v-if="errorsForm.name?.minLength" class="error">Mínimo 2 caracteres.</small>
        </div>

        <div class="form-group">
          <label for="edad">Edad *</label>
          <input
              type="number"
              id="edad"
              placeholder="25"
              v-model.number="form.age"
              required
          />
          <small v-if="errorsForm.age?.required" class="error">La edad es obligatoria.</small>
          <small v-if="errorsForm.age?.invalid" class="error">Debe tener entre 18 y 100 años.</small>
        </div>

        <div class="form-group">
          <label for="id-usuario">ID de Usuario *</label>
          <input
              type="text"
              id="id-usuario"
              placeholder="USER001"
              v-model="form.id_user_account"
              required
          />
          <small v-if="errorsForm.id_user_account?.required" class="error">
            Campo obligatorio.
          </small>
        </div>

        <div class="form-group">
          <label for="id-taller">ID del Taller *</label>
          <input
              type="text"
              id="id-taller"
              placeholder="AR001"
              v-model="form.id_auto_repair"
              required
          />
          <small v-if="selectedAutoRepair">Taller: {{ selectedAutoRepair }}</small>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancelar" @click="router.push('/technicians')">
            Cancelar
          </button>
          <button type="submit" class="btn-agregar" :disabled="isSubmitting || !isFormValid">
            {{ props.technician ? 'Actualizar' : 'Agregar' }}
          </button>
        </div>
      </form>
    </div>
  </div>


</template>

<style scoped>
.technician-details-container {
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1e4a5f;
  margin: 0 0 2rem 0;
  text-align: center;
}

.form-container {
  background-color: #fff;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.technician-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #ff9800;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.form-group input::placeholder {
  color: #999;
}

.error {
  color: #d32f2f;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancelar,
.btn-agregar {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancelar {
  background-color: #f5f5f5;
  color: #666;
}

.btn-cancelar:hover {
  background-color: #e0e0e0;
}

.btn-agregar {
  background-color: #ff9800;
  color: #fff;
}

.btn-agregar:hover:not(:disabled) {
  background-color: #f57c00;
  transform: translateY(-1px);
}

.btn-agregar:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .technician-details-container {
    padding: 1rem;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancelar,
  .btn-agregar {
    width: 100%;
  }
}
</style>