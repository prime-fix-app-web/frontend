<script setup>
import { computed, ref, watch, inject } from 'vue'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  autoRepair: {
    type: Object,
    default: undefined
  }
})

// Router y Store
const router = useRouter()
import { useAutoRepairRegisterStore } from '@/autorepair-registration/application/auto-repair.store.js'
const store = useAutoRepairRegisterStore()

// Estado reactivo del formulario
const form = ref({
  nombre_taller: '',
  nombre_usuario: '',
  telefono: '',
  departamento: '',
  direccion: '',
  password: '',
  RUC: '',
  contact_email: '',
  id_location: '',
  technicians_count: 1
})

// Estado de interfaz
const isSubmitting = ref(false)
const errorsForm = ref({
  RUC: null,
  contact_email: null,
  id_location: null
})

// Rellenar si hay prop
watch(() => props.autoRepair, (newValue) => {
  if (newValue) {
    form.value.RUC = newValue.RUC ?? ''
    form.value.contact_email = newValue.contact_email ?? ''
    form.value.technicians_count = newValue.technicians_count ?? 1
    form.value.id_location = newValue.id_location ?? ''
  }
}, { immediate: true })

// Validaciones
function validateRUC(ruc) {
  if (!ruc) return { required: true }
  if (ruc.length < 8) return { minLength: true }
  return null
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return { required: true }
  if (!emailRegex.test(email)) return { invalid: true }
  return null
}

function validateLocation(location) {
  if (!location) return { required: true }
  return null
}

// Validación total
const isFormValid = computed(() => {
  return form.value.RUC &&
      form.value.RUC.length >= 8 &&
      form.value.contact_email &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.contact_email) &&
      form.value.id_location
})

// Envío
function onSubmit() {
  errorsForm.value = { RUC: null, contact_email: null, id_location: null }

  const rucError = validateRUC(form.value.RUC)
  const emailError = validateEmail(form.value.contact_email)
  const locationError = validateLocation(form.value.id_location)

  if (rucError || emailError || locationError) {
    errorsForm.value.RUC = rucError
    errorsForm.value.contact_email = emailError
    errorsForm.value.id_location = locationError
    return
  }

  isSubmitting.value = true

  const id_auto_repair = props.autoRepair?.id_auto_repair ??
      'AR' + (Math.floor(Math.random() * 10000) + 6).toString().padStart(3, '0')

  const register = {
    id_auto_repair: id_auto_repair,
    contact_email: form.value.contact_email,
    technicians_count: form.value.technicians_count,
    id_location: form.value.id_location
  }

  try {
    if (props.autoRepair) {
      store.updateAutoRepairRegister(register)
      alert('Registro de taller actualizado correctamente.')
    } else {
      store.addAutoRepairRegister(register)
      alert('Registro de taller creado correctamente.')
    }

    router.push('/auto-repairs')
  } catch (error) {
    console.error('Error al enviar el formulario:', error)
    alert('Error al enviar el formulario. Intenta nuevamente.')
  } finally {
    isSubmitting.value = false
  }
}
</script>
<template>
  <div class="registro-taller-container">
    <div class="form-section">
      <div class="form-header">
        <h1>Crea tu cuenta, gestiona las visitas</h1>
        <p class="login-link">
          ¿Ya tienes una cuenta?
          <RouterLink to="/login">Iniciar Sesión</RouterLink>
        </p>
      </div>

      <form @submit.prevent="onSubmit" class="registro-form">
        <div class="form-group">
          <label for="nombre-taller">Nombre del taller</label>
          <input
              type="text"
              id="nombre-taller"
              placeholder="AutoReparaciones"
              v-model="form.nombre_taller"
              required
          />
        </div>

        <div class="form-group">
          <label for="nombre-usuario">Nombre de usuario</label>
          <input
              type="text"
              id="nombre-usuario"
              placeholder="repara123"
              v-model="form.nombre_usuario"
              required
          />
        </div>

        <div class="form-group">
          <label for="ruc">R.U.C.</label>
          <input
              type="text"
              id="ruc"
              placeholder="15151505016105"
              v-model="form.RUC"
              required
          />
          <small v-if="errorsForm.RUC?.required" class="error">El RUC es obligatorio.</small>
          <small v-if="errorsForm.RUC?.minLength" class="error">Debe tener al menos 8 dígitos.</small>
        </div>

        <div class="form-group">
          <label for="telefono">Número de teléfono del taller</label>
          <input
              type="tel"
              id="telefono"
              placeholder="984988166"
              v-model="form.telefono"
              required
          />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label for="departamento">Departamento</label>
            <input
                type="text"
                id="departamento"
                placeholder="Lima"
                v-model="form.departamento"
                required
            />
          </div>
          <div class="form-group half">
            <label for="distrito">Distrito</label>
            <input
                type="text"
                id="distrito"
                placeholder="Magdalena"
                v-model="form.id_location"
                required
            />
            <small v-if="errorsForm.id_location?.required" class="error">Campo obligatorio.</small>
          </div>
        </div>

        <div class="form-group">
          <label for="direccion">Dirección</label>
          <input
              type="text"
              id="direccion"
              placeholder="Castilla 696 C"
              v-model="form.direccion"
              required
          />
        </div>

        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input
              type="email"
              id="email"
              placeholder="autoreparaciones@gmail.com"
              v-model="form.contact_email"
              required
          />
          <small v-if="errorsForm.contact_email?.required" class="error">El correo es obligatorio.</small>
          <small v-if="errorsForm.contact_email?.invalid" class="error">Correo inválido.</small>
        </div>

        <div class="form-group">
          <label for="contrasena">Contraseña</label>
          <input
              type="password"
              id="contrasena"
              placeholder="••••••••"
              v-model="form.password"
              required
          />
        </div>

        <button type="submit" class="btn-registrarse" :disabled="isSubmitting || !isFormValid">
          Registrarse
        </button>
      </form>
    </div>

    <div class="image-section">
      <img
          src="/assets/images/register-workshop.webp"
          alt="Mecánico trabajando"
          class="mechanic-image"
      />
    </div>
  </div>
</template>

<style scoped>

.registro-taller-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-section {
  flex: 1;
  padding: 60px 80px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

.form-header {
  margin-bottom: 40px;
}

.form-header h1 {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.login-link {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-link a {
  color: #ff9800;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

.registro-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #ff9800;
  box-shadow: 0 0 0 3px rgba(255, 152, 0, 0.1);
}

.form-group input:disabled {
  background-color: #f9f9f9;
  color: #999;
  cursor: not-allowed;
}

.form-group input::placeholder {
  color: #999;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group.half {
  flex: 1;
  margin-bottom: 0;
}

.password-input {
  position: relative;
}

.password-input input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #333;
}

.btn-registrarse {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background-color: #ff9800;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  margin-top: 8px;
}

.btn-registrarse:hover {
  background-color: #f57c00;
}

.btn-registrarse:active {
  transform: scale(0.98);
}

.image-section {
  flex: 1;
  background-color: #1e4a5f;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.mechanic-image {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .form-section {
    padding: 40px 50px;
  }
}

@media (max-width: 768px) {
  .registro-taller-container {
    flex-direction: column;
  }

  .form-section {
    padding: 30px 24px;
  }

  .image-section {
    min-height: 300px;
    padding: 24px;
  }

  .form-header h1 {
    font-size: 24px;
  }

  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .form-group.half {
    margin-bottom: 24px;
  }
}

</style>