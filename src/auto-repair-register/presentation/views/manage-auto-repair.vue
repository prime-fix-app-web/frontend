<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { AutoRepair } from "@/auto-repair-catalog/domain/model/auto-repair.entity.js";
import { User } from "@/iam/domain/model/user.entity.js";
import { Location } from "@/auto-repair-catalog/domain/model/location.entity.js";
import useAutoRepairRegisterStore from "@/auto-repair-register/application/auto-repair.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import {useI18n} from "vue-i18n";
import * as serviceOffers from "@primeuix/themes/aura/knob";

const registerStore = useAutoRepairRegisterStore();
const trackingStore = useTrackingStore();
const catalogStore = useCatalogStore();
const iamStore = useIamStore();
const router = useRouter();

const { t } = useI18n();

const autoRepairOffers = computed(() => catalogStore.serviceOffers);
const isOffersLoading = computed(() => catalogStore.loading);

// Valores reactivos usando storeToRefs
const {
  sessionUserAccount,
  sessionUser,
} = storeToRefs(iamStore);

const {
  autoRepairs,
  loading
} = storeToRefs(catalogStore);

// Funciones/acciones mediante destructuración directa
const {
  getLocationById,
  updateAutoRepair,
  updateLocation,
} = catalogStore;

const {
  updateUser,
} = iamStore;

const isLoading = ref(false);
const successMessage = ref(null);
const errorMessage = ref(null);

const currentAutoRepair = computed(() => {
  const userAccountId = sessionUserAccount.value?.id;
  if (!userAccountId) return undefined;
  return autoRepairs.value.find(
      (ar) => ar.user_account_id === userAccountId
  );
});

const currentLocation = computed(() => {
  const user = sessionUser.value;
  if (!user) return undefined;
  return getLocationById(user.location_id);
});

const autoRepairForm = ref({
  workshopName: "",
  ruc: "",
  phoneNumber: "",
  department: "",
  district: "",
  address: "",
  email: "",
});

onMounted(() => {
  loadCurrentData();
  iamStore.fetchUsers()
  iamStore.fetchUserAccounts()
  catalogStore.fetchAutoRepairs()


  if(currentAutoRepair.value?.id){
    catalogStore.getServiceOfferById(currentAutoRepair.value.id)
  }
});

function loadCurrentData() {
  const user = sessionUser.value;
  const location = currentLocation.value;
  const autoRepair = currentAutoRepair.value;

  if (user && location && autoRepair) {
    autoRepairForm.value = {
      workshopName: sessionUserAccount.value?.username || "",
      ruc: autoRepair.ruc || "",
      phoneNumber: user.phone_number || "",
      department: location.department || "",
      district: location.district || "",
      address: location.address || "",
      email: autoRepair.contact_email || "",
    };
  }
}

function onBack() {
  router.push("/layout-workshop/dashboard-workshop");
}

function onSaveChanges() {
  const form = autoRepairForm.value;

  if (
      !form.workshopName ||
      form.workshopName.length < 3 ||
      !/^\d{11}$/.test(form.ruc) ||
      !/^\d{9}$/.test(form.phoneNumber) ||
      !form.department ||
      !form.district ||
      !form.address ||
      form.address.length < 5 ||
      !form.email ||
      !form.email.includes("@")
  ) {
    errorMessage.value = "Por favor, completa todos los campos correctamente";
    successMessage.value = null;
    setTimeout(() => (errorMessage.value = null), 5000);
    return;
  }

  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  const user = sessionUser.value;
  const location = currentLocation.value;
  const autoRepairOffers = computed(() => serviceOffers.value);
  const isOffersLoading = computed(() => loading.value);
  const autoRepair = currentAutoRepair.value;

  if (!user || !location || !autoRepair) {
    console.error("Missing required data");
    isLoading.value = false;
    errorMessage.value = "Error: No se encontraron los datos del taller";
    setTimeout(() => (errorMessage.value = null), 5000);
    return;
  }

  try {
    const updatedUser = new User({
      id: user.id,
      name: form.workshopName,
      last_name: "",
      dni: form.ruc,
      phone_number: form.phoneNumber,
      location_id: location.id,
    });
    updateUser(updatedUser);

    const updatedLocation = new Location({
      id: location.id,
      department: form.department,
      district: form.district,
      address: form.address,
    });
    updateLocation(updatedLocation);

    const updatedAutoRepair = new AutoRepair({
      id: autoRepair.id,
      ruc: form.ruc,
      contact_email: form.email,
      technicians_count: autoRepair.technicians_count,
      user_account_id: autoRepair.user_account_id,
    });
    updateAutoRepair(updatedAutoRepair.id, updatedAutoRepair);

    setTimeout(() => {
      isLoading.value = false;
      successMessage.value = "¡Cambios guardados correctamente!";
      setTimeout(() => (successMessage.value = null), 5000);
    }, 1000);
  } catch (error) {
    console.error("Error updating auto repair data:", error);
    isLoading.value = false;
    errorMessage.value =
        "Error al guardar los cambios. Por favor, intenta nuevamente.";
    setTimeout(() => (errorMessage.value = null), 5000);
  }
}

function getServiceName(id) {
  return catalogStore.getServiceById(id)?.name ?? "";
}

function goToAddService() {
  router.push("/layout-workshop/auto-repair-catalog/service-form");
}

function onDeleteOffer(id) {
  errorMessage.value = null;
  successMessage.value = null;

  const currentAutoRepairId = currentAutoRepair.value?.id;

  if (!currentAutoRepairId) {
    errorMessage.value = "Unable to determine the workshop ID.";
    return;
  }

  try {
    catalogStore.deleteServiceOffer(currentAutoRepairId, id);
  } catch (error) {
    console.error("Error deleting service offer:", error);
    errorMessage.value =
        "Failed to delete the service. Please try again.";
  }
}



</script>

<template>
  <div class="auto-repair-container">
    <h1 class="auto-repair-title">{{ t('manage-auto-repair.title') }}</h1>

    <!-- Success Message -->
    <div v-if="successMessage" class="notification-message success-message">
      <span>✓ {{ successMessage }}</span>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="notification-message error-message">
      <span>✕ {{ errorMessage }}</span>
    </div>

    <form @submit.prevent="onSaveChanges" class="auto-repair-form">
      <div class="form-card">
        <!-- Workshop Name -->
        <div class="form-group">
          <label for="workshopName" class="form-label">
            {{ t('manage-auto-repair.workshopName') }}
          </label>
          <input
              type="text"
              id="workshopName"
              v-model="autoRepairForm.workshopName"
              class="form-input"
              :placeholder="t('manage-auto-repair.workshopNamePlaceholder')"
          />
          <span v-if="!autoRepairForm.workshopName" class="error-message">
            El nombre del taller es obligatorio
          </span>
        </div>

        <!-- RUC -->
        <div class="form-group">
          <label for="ruc" class="form-label">
            {{ t('manage-auto-repair.ruc') }}
          </label>
          <input
              type="text"
              id="ruc"
              v-model="autoRepairForm.ruc"
              class="form-input"
              :placeholder="t('manage-auto-repair.rucPlaceholder')"
              maxlength="11"
          />
          <span
              v-if="!autoRepairForm.ruc"
              class="error-message"
          >
            El RUC es obligatorio
          </span>
        </div>

        <!-- Phone Number -->
        <div class="form-group">
          <label for="phoneNumber" class="form-label">
            {{ t('manage-auto-repair.phoneNumber') }}
          </label>
          <input
              type="text"
              id="phoneNumber"
              v-model="autoRepairForm.phoneNumber"
              class="form-input"
              :placeholder="t('manage-auto-repair.phoneNumberPlaceholder')"
              maxlength="9"
          />
          <span
              v-if="!autoRepairForm.phoneNumber"
              class="error-message"
          >
            El teléfono es obligatorio
          </span>
        </div>

        <!-- Department and District -->
        <div class="form-row">
          <div class="form-group">
            <label for="department" class="form-label">
              {{ t('manage-auto-repair.department') }}
            </label>
            <input
                type="text"
                id="department"
                v-model="autoRepairForm.department"
                class="form-input"
                :placeholder="t('manage-auto-repair.departmentPlaceholder')"
            />
            <span v-if="!autoRepairForm.department" class="error-message">
              El departamento es obligatorio
            </span>
          </div>

          <div class="form-group">
            <label for="district" class="form-label">
              {{ t('manage-auto-repair.district') }}
            </label>
            <input
                type="text"
                id="district"
                v-model="autoRepairForm.district"
                class="form-input"
                :placeholder="t('manage-auto-repair.districtPlaceholder')"
            />
            <span v-if="!autoRepairForm.district" class="error-message">
              El distrito es obligatorio
            </span>
          </div>
        </div>

        <!-- Address -->
        <div class="form-group">
          <label for="address" class="form-label">
            {{ t('manage-auto-repair.address') }}
          </label>
          <input
              type="text"
              id="address"
              v-model="autoRepairForm.address"
              class="form-input"
              :placeholder="t('manage-auto-repair.addressPlaceholder')"
          />
          <span v-if="!autoRepairForm.address" class="error-message">
            La dirección es obligatoria
          </span>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">
            {{ t('manage-auto-repair.email') }}
          </label>
          <input
              type="email"
              id="email"
              v-model="autoRepairForm.email"
              class="form-input"
              placeholder="autorepairs@gmail.com"
          />
          <span v-if="!autoRepairForm.email" class="error-message">
            El correo electrónico es obligatorio
          </span>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button type="button" class="btn-back" @click="onBack">
          {{ t('manage-auto-repair.back') }}
        </button>
        <button type="submit" class="btn-save" :disabled="isLoading">
          <template v-if="isLoading">Guardando...</template>
          <template v-else>{{ t('manage-auto-repair.saveChanges') }}</template>
        </button>
      </div>
    </form>
  </div>

  <div class="auto-repair-service-container">
    <h2 class="auto-repair-title">{{ t('manage-auto-repair.catalogTitle') }}</h2>

    <div v-if="isOffersLoading">{{ t('general.loadingCatalog') }}...</div>

    <div v-else-if="autoRepairOffers.length > 0" class="offers-cards">
      <div v-for="offer in autoRepairOffers" :key="offer.service_offer_id" class="offer-card">
        <h3 class="service-name">{{ getServiceName(offer.service_id) }}</h3>
        <p class="price"><strong>{{ t('manage-auto-repair.price') }}:</strong> {{ offer.price }}</p>
        <p class="duration"><strong>{{ t('manage-auto-repair.duration') }}:</strong> {{ offer.duration_hour }}</p>
        <div class="actions">
          <button class="btn-delete" @click="onDeleteOffer(offer.service_offer_id)">{{ t('manage-auto-repair.delete') }}</button>
        </div>
      </div>
    </div>

    <div v-else>{{ t('manage-auto-repair.noOffers') }}</div>

    <div class="catalog-action-footer">
      <button class="btn-add-service" @click="goToAddService">{{ t('manage-auto-repair.addService') }}</button>
    </div>
  </div>
</template>

<style scoped>
.auto-repair-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.auto-repair-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0 0 2rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

/* Notification Messages */
.notification-message {
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-family: var(--font-medium);
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 2px solid #c3e6cb;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 2px solid #f5c6cb;
}

/* Form Container */
.auto-repair-form {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
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
  margin-bottom: 0.25rem;
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

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  font-family: var(--font-regular);
  font-size: 0.85rem;
  color: #d32f2f;
  margin-top: 0.25rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.btn-back {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 0.875rem 2.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.btn-back:hover {
  background-color: var(--color-primary);
  color: var(--color-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-save {
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
  min-width: 150px;
}

.btn-save:hover:not(:disabled) {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .auto-repair-container {
    padding: 1rem;
  }

  .auto-repair-title {
    font-size: 2rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-back,
  .btn-save {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .auto-repair-title {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 1rem;
  }

  .form-input {
    padding: 0.75rem 0.875rem;
    font-size: 0.95rem;
  }
}

.offers-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 1500px;
  margin-bottom: 40px;
}

.offer-card {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.actions {
  margin-left: auto;
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.btn-edit{
  background-color: transparent;
  color: var(--color-first-complementary);
  border: 2px solid var(--color-first-complementary);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-delete:hover {
  background-color: var(--color-primary);
  color:white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

.btn-edit:hover {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

.catalog-action-footer {
  width: 100%;
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end; /* derecha */
}

.btn-add-service {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.9rem 2.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.btn-add-service:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

</style>