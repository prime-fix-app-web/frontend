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
  id_user_account: '',
  username: '',
  email: '',
  id_role: ''
})

// UI state
const isSubmitting = ref(false)
// CORREGIDO: campos de errorsForm
const errorsForm = ref({
  username: null,
  email: null,
  id_user_account: null,
  id_role: null
})

// Watch for prop changes to populate form
watch(
    () => props.technician,
    (newValue) => {
      if (newValue) {
        form.value.id_user_account = newValue.id_user_account ?? ''
        form.value.username = newValue.username ?? ''
        form.value.email = newValue.email ?? ''
        form.value.id_role = newValue.id_role ?? ''
      }
    },
    { immediate: true }
)

// Validaciones simples
function validateUsername(username) {
  if (!username) return { required: true }
  if (username.length < 2) return { minLength: true }
  return null
}

function validateEmail(email) {
  if (!email) return { required: true }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return { invalid: true }
  return null
}

function validateUserAccount(account) {
  if (!account) return { required: true }
  return null
}

function validateRole(role) {
  if (!role) return { required: true }
  return null
}

// Validación global
const isFormValid = computed(() => {
  return (
      form.value.username.length >= 2 &&
      form.value.email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email) &&
      form.value.id_user_account &&
      form.value.id_role
  )
})
async function submit() {
  // Reset de errores
  errorsForm.value = {
    username: null,
    email: null,
    id_user_account: null,
    id_role: null
  }

  // Validaciones
  const usernameError = validateUsername(form.value.username)
  const emailError = validateEmail(form.value.email)
  const userError = validateUserAccount(form.value.id_user_account)
  const roleError = validateRole(form.value.id_role)

  if (usernameError || emailError || userError || roleError) {
    errorsForm.value.username = usernameError
    errorsForm.value.email = emailError
    errorsForm.value.id_user_account = userError
    errorsForm.value.id_role = roleError
    return
  }

  isSubmitting.value = true

  try {
    const technicianData = {
      username: form.value.username,
      email: form.value.email,
      id_role: form.value.id_role
    }

    console.log('🔧 === MODO:', props.technician ? 'EDICIÓN' : 'CREACIÓN', '===')

    if (props.technician) {
      // ✅ MODO EDICIÓN - Usar el ID original
      technicianData.id_user_account = props.technician.id_user_account
      technicianData.id_technician = props.technician.id_technician

      console.log('📝 Editando técnico existente:', props.technician)
      console.log('🔄 Datos para edición:', technicianData)

      await autoRepairStore.updateTechnician(technicianData)
      alert('✅ Técnico actualizado correctamente.')
    } else {
      // ✅ MODO CREACIÓN - Generar nuevos IDs
      technicianData.id_user_account = form.value.id_user_account
      technicianData.id_technician = 'TECH' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')

      console.log('🆕 Creando nuevo técnico:', technicianData)
      await autoRepairStore.addTechnician(technicianData)
      alert('✅ Técnico creado correctamente.')
    }

    // Recargar la lista
    await autoRepairStore.fetchTechnicians()
    router.push('/technicians')

  } catch (error) {
    console.error('❌ Error al procesar técnico:', error)
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
          <label for="username">Nombre de usuario *</label>
          <input
              type="text"
              id="username"
              placeholder="jgrimaldo"
              v-model="form.username"
              required
          />
          <small v-if="errorsForm.username?.required" class="error">El nombre de usuario es obligatorio.</small>
          <small v-if="errorsForm.username?.minLength" class="error">Mínimo 2 caracteres.</small>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
              type="email"
              id="email"
              placeholder="tecnico@taller.com"
              v-model="form.email"
              required
          />
          <small v-if="errorsForm.email?.required" class="error">El email es obligatorio.</small>
          <small v-if="errorsForm.email?.invalid" class="error">Formato de email inválido.</small>
        </div>

        <div class="form-group">
          <label for="id-role">ID de Rol *</label>
          <input
              type="text"
              id="id-role"
              placeholder="R002 --- NECESARIO PARA VALIDACION"
              v-model="form.id_role"
              required
          />
          <small v-if="errorsForm.id_role?.required" class="error">
            Campo obligatorio.
          </small>
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