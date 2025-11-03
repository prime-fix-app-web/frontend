<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoRepairRegisterStore } from '@/autorepair-registration/application/auto-repair.store.js'
import LayoutOwner from "@/shared/presentation/components/layout-owner.vue"

// Router y Stores
const router = useRouter()
const autoRepairStore = useAutoRepairRegisterStore()

// State
const technicians = ref([])
const loading = ref(false)
const error = ref(null)

// Form state
const name = ref('')
const schedules = ref([
  { day: 'Miércoles', start: '10:00', end: '18:00' },
  { day: 'Jueves', start: '10:00', end: '18:00' },
  { day: 'Viernes', start: '10:00', end: '18:00' }
])

// Lifecycle
onMounted(() => {
  loadTechnicians()
})

// Carga de técnicos
async function loadTechnicians() {
  loading.value = true;
  error.value = null;

  try {
    await autoRepairStore.fetchTechnicians();


    console.log('🔍 TODOS los usuarios del store:', autoRepairStore.technicians)


    technicians.value = autoRepairStore.technicians.filter(
        tech => tech.id_role === 'R002'
    );

    console.log('🎯 Técnicos filtrados (R002):', technicians.value);


    if (technicians.value.length === 0) {
      console.log('⚠️ No se encontraron técnicos con rol R002')
    }

  } catch (err) {
    console.error('Failed to fetch technicians:', err);
    error.value = 'Error al cargar técnicos: ' + (err.message || 'Desconocido');
  } finally {
    loading.value = false;
  }
}

function deleteTechnician(tech) {
  if (!confirm(`¿Seguro que deseas eliminar al técnico ${tech.username}?`)) return

  console.log('🗑️ Eliminando técnico del frontend:', tech.username)


  const initialCount = technicians.value.length
  technicians.value = technicians.value.filter(t => t.id_user_account !== tech.id_user_account)
  const finalCount = technicians.value.length

  if (finalCount < initialCount) {
    alert('✅ Técnico eliminado correctamente')
    console.log('🎉 Eliminación frontend exitosa')
  } else {
    alert('❌ Error: No se pudo eliminar el técnico')
  }


  console.log('⚠️ Backend deshabilitado temporalmente')
}

function getAutoRepairName(id_auto_repair) {
  const ar = autoRepairStore.autoRepairRegisters.find(repair =>
      repair.id_auto_repair === id_auto_repair
  )
  return ar?.ruc ?? 'Desconocido'
}

function editTechnician(tech) {
  // USAR id_user_account para editar también
  router.push('/technicians/edit/' + tech.id_user_account)
}
function submit() {
  if (!name.value) {
    alert('Por favor ingresa el nombre del técnico.')
    return
  }

  console.log('Agregar técnico:', name.value)
  console.log('Horarios:', schedules.value)
  alert(`Se intentaría agregar el técnico: ${name.value}`)
}

function createNew() {
  router.push('/technicians/new')
}

function addScheduleDay() {
  schedules.value.push({ day: 'Lunes', start: '10:00', end: '18:00' })
}

function removeScheduleDay(index) {
  schedules.value.splice(index, 1)
}

function updateSchedule(index, field, value) {
  schedules.value[index][field] = value
}
function getRoleDisplay(roleId) {
  const roles = {
    'R001': 'Administrador',
    'R002': 'Técnico',
    'R003': 'Usuario',
    'R004': 'Cliente'
  }
  return roles[roleId] || roleId
}
</script>

<template>

  <div class="technician-list-container">
    <div class="content-header">
      <h1 class="page-title">Gestionar técnicos</h1>
      <button class="btn-agregar" @click="createNew">Agregar Técnico</button>
    </div>

    <!-- Estado de carga -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando técnicos...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button class="btn-retry" @click="loadTechnicians">Reintentar</button>
    </div>

    <!-- Lista de técnicos -->
    <div v-else class="tecnicos-lista">
      <div v-for="tech in technicians" :key="tech.id_user_account" class="tecnico-card">
        <div class="tecnico-info">
          <h3>{{ tech.username }}</h3>
          <div class="tecnico-details">
            <p><strong>Email:</strong> {{ tech.email }}</p>
            <p><strong>Rol:</strong> {{ getRoleDisplay(tech.id_role) }}</p>
            <p><strong>ID Usuario:</strong> {{ tech.id_user_account }}</p>
          </div>
        </div>
        <div class="tecnico-acciones">
          <button class="btn-editar" @click="editTechnician(tech)">
            Editar
          </button>
          <button class="btn-eliminar" @click="deleteTechnician(tech)">
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Formulario de agregar (opcional, puedes moverlo a otra página) -->
    <div class="form-container">
      <h3>Agregar Nuevo Técnico</h3>
      <form class="technician-form" @submit.prevent="submit">
        <div class="form-group">
          <label for="nombre-tecnico">Nombre de técnico</label>
          <input
              type="text"
              id="nombre-tecnico"
              placeholder="Jesús Grimaldo"
              v-model="name"
              required
          />
        </div>

        <div class="horarios-section">
          <h4>Horarios de atención</h4>
          <div class="horarios-grid">
            <div class="horario-header">
              <span class="header-dia">Día</span>
              <span class="header-hora">Hora de inicio</span>
              <span class="header-hora">Hora de fin</span>
            </div>

            <div
                class="horario-row"
                v-for="(schedule, i) in schedules"
                :key="i"
            >
              <select class="select-dia" v-model="schedule.day">
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>

              <input type="time" class="input-hora" v-model="schedule.start" />
              <input type="time" class="input-hora" v-model="schedule.end" />
            </div>
          </div>

          <button type="button" class="btn-anadir-dia" @click="addScheduleDay">
            Añadir otro día
          </button>
        </div>

        <button type="submit" class="btn-agregar-form">Agregar</button>
      </form>
    </div>
  </div>

</template>

<style scoped>
.technician-list-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #1e4a5f;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 600;
  color: #1e4a5f;
  margin: 0;
}

.btn-agregar {
  padding: 0.75rem 1.5rem;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-agregar:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
}

/* Estados de carga y error */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff9800;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state p {
  color: #d32f2f;
  font-size: 1rem;
}

.btn-retry {
  padding: 0.5rem 1rem;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

/* Lista de técnicos */
.tecnicos-lista {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tecnico-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1.5rem;
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.tecnico-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tecnico-details p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.tecnico-acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-editar,
.btn-eliminar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-editar {
  background-color: #ff9800;
  color: #fff;
}

.btn-editar:hover {
  background-color: #f57c00;
}

.btn-eliminar {
  background-color: #fff;
  color: #ff9800;
  border: 2px solid #ff9800;
}

.btn-eliminar:hover {
  background-color: #fff3e0;
}

/* Formulario */
.form-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 2rem;
}

.form-container h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e4a5f;
  margin: 0 0 1.5rem 0;
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
  font-size: 0.875rem;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f9f9f9;
  transition: all 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #ff9800;
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

/* Horarios */
.horarios-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem 0;
}

.horarios-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.horario-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  padding: 0 0.25rem;
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.horario-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.75rem;
  align-items: center;
}

.select-dia,
.input-hora {
  padding: 0.5rem;
  font-size: 0.875rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  transition: all 0.3s;
}

.select-dia:focus,
.input-hora:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.1);
}

.btn-anadir-dia {
  padding: 0.5rem 1rem;
  background-color: #fff;
  color: #ff9800;
  border: 2px solid #ff9800;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}

.btn-anadir-dia:hover {
  background-color: #fff3e0;
}

.btn-agregar-form {
  padding: 0.75rem 1.5rem;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-start;
}

.btn-agregar-form:hover {
  background-color: #f57c00;
}

/* Responsive */
@media (max-width: 768px) {
  .technician-list-container {
    padding: 1rem;
  }

  .content-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .tecnico-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .tecnico-acciones {
    width: 100%;
  }

  .btn-editar,
  .btn-eliminar {
    flex: 1;
  }

  .horario-header {
    display: none;
  }

  .horario-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 6px;
  }
}
</style>