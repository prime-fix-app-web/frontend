<script setup>
import {ref, computed, reactive, watch, onMounted} from 'vue';
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import {Vehicle} from "@/maintenance-tracking/domain/model/vehicle.entity.js";

const trackingStore = useTrackingStore();
const iamStore = useIamStore();

const sessionUser = computed(() => iamStore.sessionUser);

const showModal = ref(false);
const isEditMode = ref(false);
const selectedVehicleId = ref(null);

const vehiclesByUserId = computed(() => {
  const currentUser = iamStore.sessionUser;
  if (!currentUser || !currentUser.id_user) return [];
  if (!trackingStore.vehicles || !Array.isArray(trackingStore.vehicles)) return [];

  // Filtramos por usuario y además por estado activo
  return trackingStore.vehicles.filter(
      (v) => v.id_user === currentUser.id_user && v.state_maintenance !== -1
  );
});

async function deleteVehicleById(id_vehicle) {
  try {
    if (!id_vehicle) throw new Error("Id del vehículo requerido");

    // Llamamos al endpoint de trackingApi
    const res = await trackingStore.deleteVehicle(id_vehicle);

    // Eliminamos del store local si quieres
    const index = trackingStore.vehicles.findIndex(v => v.id_vehicle === id_vehicle);
    if (index !== -1) {
      trackingStore.vehicles.splice(index, 1);
    }

    console.log(`Vehículo ${id_vehicle} eliminado correctamente`);
    return res;
  } catch (error) {
    console.error("Error al eliminar vehículo:", error);
    throw error;
  }
}

const vehicleForm = reactive({
  model: '',
  brand: '',
  plate: '',
  color: '',
  type: ''
});

const errors = reactive({
  model: null,
  brand: null,
  plate: null,
  color: null,
  type: null
});

const validateForm = () => {
  errors.model = vehicleForm.model.length < 2 ? 'Requerido, mínimo 2 caracteres' : null;
  errors.brand = vehicleForm.brand.length < 2 ? 'Requerido, mínimo 2 caracteres' : null;
  errors.plate = vehicleForm.plate.length < 3 ? 'Requerido, mínimo 3 caracteres' : null;
  errors.color = vehicleForm.color.length < 2 ? 'Requerido, mínimo 2 caracteres' : null;
  errors.type = vehicleForm.type.length < 2 ? 'Requerido, mínimo 2 caracteres' : null;

  return !Object.values(errors).some(e => e !== null);
};

const onAddVehicle = () => {
  isEditMode.value = false;
  selectedVehicleId.value = null;
  Object.keys(vehicleForm).forEach(key => vehicleForm[key] = '');
  showModal.value = true;
};

const onEditVehicle = (vehicle) => {
  isEditMode.value = true;
  selectedVehicleId.value = vehicle.id_vehicle;
  vehicleForm.model = vehicle.model;
  vehicleForm.brand = vehicle.vehicle_brand;
  vehicleForm.type = vehicle.vehicle_type;
  vehicleForm.plate = vehicle.vehicle_plate;
  vehicleForm.color = vehicle.color;
  showModal.value = true;
};

const onDeleteVehicle = async (vehicle) => {
  if (!vehicle?.id_vehicle) return;

  try {
    await trackingStore.updateVehicle(vehicle.id_vehicle, {
      state_maintenance: -1 // -1 indica inactivo
    });

    alert("Vehículo marcado como inactivo");

    trackingStore.fetchVehicles();
  } catch (error) {
    console.error("Error al desactivar el vehículo:", error);
  }
};

const onCloseModal = () => {
  showModal.value = false;
  Object.keys(vehicleForm).forEach(key => vehicleForm[key] = '');
  selectedVehicleId.value = null;
};

const onSubmit = () => {
  if (!validateForm()) return;

  const userId = sessionUser.value?.id_user || '';
  if (isEditMode.value) {
    const vehicleId = selectedVehicleId.value;
    if (vehicleId) {
      const updatedVehicle = new Vehicle({
        id_vehicle: vehicleId,
        model: vehicleForm.model,
        vehicle_plate: vehicleForm.plate,
        color: vehicleForm.color,
        id_user: userId,
        vehicle_brand: vehicleForm.brand,
        vehicle_type: vehicleForm.type,
        state_maintenance: 0
      });
      trackingStore.updateVehicle(updatedVehicle.id_vehicle,updatedVehicle);
    }
  } else {
    const newId = crypto.randomUUID();

    const newVehicle = new Vehicle({
      id_vehicle: newId,
      model: vehicleForm.model,
      vehicle_plate: vehicleForm.plate,
      color: vehicleForm.color,
      id_user: userId,
      vehicle_brand: vehicleForm.brand,
      vehicle_type: vehicleForm.type,
      state_maintenance: 0
    });
    trackingStore.addVehicle(newVehicle);
  }

  onCloseModal();
};
onMounted(async () => {

  if (sessionUser.value?.id_user) {
    await trackingStore.fetchVehicles();
  }
});

</script>

<template>
  <div class="vehicles-container">
    <h1 class="vehicles-title">{{ $t('manage-vehicles.title') }}</h1>

    <!-- Add Vehicle Button -->
    <div class="header-actions">
      <button class="btn-add-vehicle" @click="onAddVehicle">
        {{ $t('manage-vehicles.addVehicle') }}
      </button>
    </div>

    <div class="vehicles-list">
      <div v-for="vehicle in vehiclesByUserId" :key="vehicle.id_vehicle" class="vehicle-card">
        <div class="vehicle-info">
          <h3 class="vehicle-model">{{ $t('manage-vehicles.vehicleModel') }}: {{ vehicle.model }}</h3>
          <p class="vehicle-detail">
            <span class="detail-label">{{ $t('manage-vehicles.brand') }}:</span> {{ vehicle.vehicle_brand }}
          </p>
          <p class="vehicle-detail">
            <span class="detail-label">{{ $t('manage-vehicles.color') }}:</span> {{ vehicle.color }}
          </p>
          <p class="vehicle-detail">
            <span class="detail-label">{{ $t('manage-vehicles.plate') }}:</span> {{ vehicle.vehicle_plate }}
          </p>
          <p class="vehicle-detail">
            <span class="detail-label">{{ $t('manage-vehicles.type') }}:</span> {{ vehicle.vehicle_type }}
          </p>
        </div>
        <div class="vehicle-actions">
          <button class="btn-edit" @click="onEditVehicle(vehicle)">
            {{ $t('manage-vehicles.edit') }}
          </button>
          <button class="btn-delete" @click="deleteVehicleById(vehicle.id_vehicle)">
            {{ $t('manage-vehicles.delete') }}
          </button>
        </div>
      </div>

      <p v-if="vehiclesByUserId.length === 0" class="no-vehicles">
        {{ $t('manage-vehicles.noVehicles') }}
      </p>
    </div>
  </div>

  <div v-if="showModal" class="modal-overlay" @click="onCloseModal">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">
        {{ isEditMode ? $t('manage-vehicles.modalEditTitle') : $t('manage-vehicles.modalAddTitle') }}
      </h2>

      <form @submit.prevent="onSubmit" class="vehicle-form">
        <!-- Model Field -->
        <div class="form-group">
          <label for="model" class="form-label">{{ $t('manage-vehicles.modelLabel') }}</label>
          <input
              type="text"
              id="model"
              v-model="vehicleForm.model"
              class="form-input"
              :placeholder="$t('manage-vehicles.modelPlaceholder')"
          />
          <span v-if="errors.model" class="error-message">{{ errors.model }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="brand" class="form-label">{{ $t('manage-vehicles.brandLabel') }}</label>
            <input
                type="text"
                id="brand"
                v-model="vehicleForm.brand"
                class="form-input"
                :placeholder="$t('manage-vehicles.brandPlaceholder')"
            />
            <span v-if="errors.brand" class="error-message">{{ errors.brand }}</span>
          </div>

          <div class="form-group">
            <label for="type" class="form-label">{{ $t('manage-vehicles.typeLabel') }}</label>
            <input
                type="text"
                id="type"
                v-model="vehicleForm.type"
                class="form-input"
                :placeholder="$t('manage-vehicles.typePlaceholder')"
            />
            <span v-if="errors.type" class="error-message">{{ errors.type }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="plate" class="form-label">{{ $t('manage-vehicles.plateLabel') }}</label>
            <input
                type="text"
                id="plate"
                v-model="vehicleForm.plate"
                class="form-input"
                :placeholder="$t('manage-vehicles.platePlaceholder')"
            />
            <span v-if="errors.plate" class="error-message">{{ errors.plate }}</span>
          </div>

          <div class="form-group">
            <label for="color" class="form-label">{{ $t('manage-vehicles.colorLabel') }}</label>
            <input
                type="text"
                id="color"
                v-model="vehicleForm.color"
                class="form-input"
                :placeholder="$t('manage-vehicles.colorPlaceholder')"
            />
            <span v-if="errors.color" class="error-message">{{ errors.color }}</span>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="onCloseModal">
            {{ $t('manage-vehicles.cancel') }}
          </button>
          <button type="submit" class="btn-submit">
            {{ isEditMode ? $t('manage-vehicles.save') : $t('manage-vehicles.add') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.vehicles-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.vehicles-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0 0 1.5rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

/* Header Actions */
.header-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.btn-add-vehicle {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.875rem 2.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
}

.btn-add-vehicle:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

/* Vehicles List */
.vehicles-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.vehicle-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.vehicle-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.vehicle-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.vehicle-model {
  font-family: var(--font-semibold);
  font-size: 1.3rem;
  color: var(--color-dark);
  margin: 0;
}

.vehicle-detail {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
}

.detail-label {
  font-family: var(--font-medium);
}

/* Vehicle Actions */
.vehicle-actions {
  display: flex;
  gap: 0.75rem;
  flex-direction: column;
}

.btn-edit,
.btn-delete {
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  min-width: 120px;
}

.btn-edit {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
}

.btn-edit:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.btn-delete {
  background-color: transparent;
  color: var(--color-first-complementary);
  border: 2px solid var(--color-first-complementary);
}

.btn-delete:hover {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

.no-vehicles {
  text-align: center;
  font-family: var(--font-regular);
  font-size: 1.1rem;
  color: var(--color-dark);
  padding: 3rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-second-complementary);
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--color-primary);
}

.modal-title {
  font-family: var(--font-bold);
  font-size: 1.8rem;
  color: var(--color-primary);
  margin: 0 0 1.5rem 0;
  text-align: center;
}

/* Form Styles */
.vehicle-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-medium);
  font-size: 1rem;
  color: var(--color-dark);
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-primary);
  border-radius: 25px;
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  background-color: var(--color-light);
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 3px rgba(242, 170, 31, 0.1);
}

.error-message {
  font-family: var(--font-regular);
  font-size: 0.85rem;
  color: #d32f2f;
  margin-top: 0.25rem;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.btn-cancel {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel:hover {
  background-color: var(--color-primary);
  color: var(--color-light);
}

.btn-submit {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
}

.btn-submit:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .vehicles-container {
    padding: 1rem;
  }

  .vehicles-title {
    font-size: 2rem;
  }

  .vehicle-card {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .vehicle-actions {
    flex-direction: row;
    width: 100%;
  }

  .btn-edit,
  .btn-delete {
    flex: 1;
    min-width: auto;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}

</style>