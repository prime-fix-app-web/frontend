<script setup>
import { useAutoRepairRegisterStore } from '@/autorepair-registration/application/auto-repair.store.js';
import { ref, computed, watch, inject } from 'vue'
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
  <div class="gestionar-tecnicos-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="profile-section">
        <img src="/assets/images/profile-placeholder.jpg" alt="Perfil" class="profile-image" />
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/perfil" class="nav-item">Perfil</RouterLink>
        <RouterLink to="/menu-inicial" class="nav-item">Menú inicial</RouterLink>
        <RouterLink to="/taller" class="nav-item">Taller</RouterLink>
        <RouterLink to="/solicitudes" class="nav-item">Solicitudes</RouterLink>
        <RouterLink to="/technicians" class="nav-item active">Gestionar técnicos</RouterLink>
        <RouterLink to="/estado-coches" class="nav-item">Estado de coches</RouterLink>
        <RouterLink to="/configuracion" class="nav-item">Configuración</RouterLink>
      </nav>

      <button class="btn-cerrar-sesion">Cerrar sesión</button>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
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
    </main>
  </div>
</template>

<style scoped>
.gestionar-tecnicos-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f5f5f5;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background-color: #1e4a5f;
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 30px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
}

.profile-section {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  padding: 0 20px;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-item.active {
  background-color: rgba(255, 152, 0, 0.2);
  color: #ffa726;
  font-weight: 600;
}

.nav-item svg {
  flex-shrink: 0;
}

.btn-cerrar-sesion {
  margin: 20px 20px 0;
  padding: 14px 24px;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-cerrar-sesion:hover {
  background-color: #f57c00;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 3px solid #1e4a5f;
}

.content-header h1 {
  font-size: 36px;
  font-weight: 600;
  color: #1e4a5f;
  margin: 0;
}

.btn-agregar {
  padding: 12px 28px;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.btn-agregar:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

/* Técnicos Lista */
.tecnicos-lista {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.tecnico-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: box-shadow 0.3s;
}

.tecnico-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.tecnico-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
}

.horarios {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.horario-item {
  display: flex;
  gap: 40px;
  font-size: 15px;
}

.dia {
  color: #333;
  font-weight: 500;
  min-width: 80px;
}

.horas {
  color: #666;
  font-family: 'Courier New', monospace;
}

.tecnico-acciones {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 140px;
}

.btn-editar,
.btn-eliminar {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  width: 100%;
}

.btn-editar {
  background-color: #ff9800;
  color: #fff;
}

.btn-editar:hover {
  background-color: #f57c00;
  transform: translateY(-1px);
}

.btn-eliminar {
  background-color: #fff;
  color: #ff9800;
  border: 2px solid #ff9800;
}

.btn-eliminar:hover {
  background-color: #fff3e0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    padding: 30px 40px;
  }

  .content-header h1 {
    font-size: 30px;
  }
}

@media (max-width: 768px) {
  .gestionar-tecnicos-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 20px 0;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-item {
    flex: 0 0 auto;
  }

  .main-content {
    padding: 24px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .btn-agregar {
    width: 100%;
  }

  .tecnico-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .tecnico-acciones {
    width: 100%;
  }

  .horario-item {
    gap: 20px;
  }

  .dia {
    min-width: 70px;
  }
}
</style>