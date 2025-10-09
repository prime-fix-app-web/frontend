<script setup>
import { ref, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'

// Router y Stores
const router = useRouter()
const autoRepairStore = inject('autoRepairRegisterStore')

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
  loading.value = true
  error.value = null

  try {
    await autoRepairStore.fetchTechnicians()
    technicians.value = autoRepairStore.technicians
    console.log('Technicians loaded:', technicians.value)
  } catch (err) {
    console.error('Failed to fetch technicians:', err)
    error.value = 'Error al cargar técnicos: ' + (err.message || 'Desconocido')
  } finally {
    loading.value = false
  }
}

function deleteTechnician(tech) {
  if (!confirm(`¿Seguro que deseas eliminar al técnico ${tech.name}?`)) return

  autoRepairStore.deleteTechnician(tech.id_technician)
      .then(() => {
        technicians.value = technicians.value.filter(t => t.id_technician !== tech.id_technician)
        alert('Técnico eliminado correctamente.')
      })
      .catch(err => {
        alert('No se pudo eliminar el técnico: ' + err.message)
      })
}

function getAutoRepairName(id_auto_repair) {
  const ar = autoRepairStore.autoRepairRegisters.find(repair =>
      repair.id_auto_repair === id_auto_repair
  )
  return ar?.RUC ?? 'Desconocido'
}

function editTechnician(id) {
  router.push('/technicians/edit/' + id)
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
</script>

<template>
  <div class="gestionar-tecnicos-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="profile-section">
        <img
            src="/assets/images/profile-placeholder.jpg"
            alt="Perfil"
            class="profile-image"
        />
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
      <h1 class="page-title">Gestionar técnicos</h1>

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

      <!-- Formulario -->
      <div v-else class="form-container">
        <form class="technician-form" @submit.prevent="submit">
          <div class="form-group">
            <label for="nombre-tecnico">Nombre de técnico</label>
            <input
                type="text"
                id="nombre-tecnico"
                placeholder="Jesús Grimaldo"
                v-model="name"
                name="name"
                required
            />
          </div>

          <div class="horarios-section">
            <h3>Horarios de atención</h3>

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
                <select
                    class="select-dia"
                    v-model="schedule.day"
                    :name="'dia' + i"
                >
                  <option value="Lunes">Lunes</option>
                  <option value="Martes">Martes</option>
                  <option value="Miércoles">Miércoles</option>
                  <option value="Jueves">Jueves</option>
                  <option value="Viernes">Viernes</option>
                  <option value="Sábado">Sábado</option>
                  <option value="Domingo">Domingo</option>
                </select>

                <input
                    type="time"
                    class="input-hora"
                    v-model="schedule.start"
                    :name="'inicio' + i"
                />

                <input
                    type="time"
                    class="input-hora"
                    v-model="schedule.end"
                    :name="'fin' + i"
                />
              </div>
            </div>

            <button type="button" class="btn-anadir-dia" @click="addScheduleDay">
              Añadir otro día
            </button>
          </div>

          <button type="submit" class="btn-agregar">Agregar</button>
        </form>
      </div>
    </main>
  </div>
</template>

<style scoped>  .gestionar-tecnicos-container {
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

.page-title {
  font-size: 36px;
  font-weight: 600;
  color: #1e4a5f;
  margin: 0 0 40px 0;
  padding-bottom: 20px;
  border-bottom: 3px solid #1e4a5f;
}

/* Loading and Error States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 20px;
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
  font-size: 16px;
}

.btn-retry {
  padding: 10px 24px;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

/* Form Container */
.form-container {
  max-width: 800px;
  background-color: #fff;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.technician-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  padding: 12px 16px;
  font-size: 15px;
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

/* Horarios Section */
.horarios-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.horarios-section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.horarios-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.horario-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 0 4px;
}

.horario-header span {
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.horario-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  align-items: center;
}

.select-dia,
.input-hora {
  padding: 10px 14px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
}

.select-dia:focus,
.input-hora:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.input-hora {
  font-family: 'Courier New', monospace;
}

.btn-anadir-dia {
  padding: 10px 20px;
  background-color: #fff;
  color: #ff9800;
  border: 2px solid #ff9800;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  align-self: flex-start;
}

.btn-anadir-dia:hover {
  background-color: #fff3e0;
}

.btn-agregar {
  padding: 14px 32px;
  background-color: #ff9800;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
  align-self: center;
  min-width: 200px;
}

.btn-agregar:hover {
  background-color: #f57c00;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.btn-agregar:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .main-content {
    padding: 30px 40px;
  }

  .page-title {
    font-size: 30px;
  }

  .form-container {
    padding: 30px;
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

  .form-container {
    padding: 24px;
  }

  .horario-header {
    display: none;
  }

  .horario-row {
    grid-template-columns: 1fr;
    gap: 8px;
    padding: 16px;
    background-color: #f9f9f9;
    border-radius: 8px;
  }

  .select-dia::before {
    content: 'Día: ';
    font-weight: 600;
  }

  .btn-agregar {
    width: 100%;
  }
}</style>