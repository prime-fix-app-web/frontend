<script setup >
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import { useI18n } from 'vue-i18n';
import {Service} from "@/auto-repair-catalog/domain/model/service.entity.js";

const router = useRouter();
const catalogStore = useCatalogStore();
const { t } = useI18n();

const isLoading = computed(() => catalogStore.loading);

const errorMessage = ref(null);
const successMessage = ref(null);

let selectedServiceId = ref(null);
const recentlyCreatedService = ref(null);
const isFilteringByRecent = ref(true);

const allServices = computed(() => catalogStore.services);
const serviceForm = ref(new Service({
  name:'',
  description:''
}));


const displayedServices = computed(() => {
  return isFilteringByRecent.value
      ? (recentlyCreatedService.value ? [recentlyCreatedService.value] : [])
      : allServices.value;
});
const servicesWithOffers = computed(() => {
  const services = catalogStore.fetchServices() || []; 
  return services.map(o => o.id);
});

const availableServices = computed(() =>
    allServices.value.filter(s => !servicesWithOffers.value.includes(String(s.id)))
);

function hasOffer(serviceId) {
  return servicesWithOffers.value.includes(String(serviceId));
}

async function onCreateService() {
  errorMessage.value = null;
  successMessage.value = null;
  if (!serviceForm.value.name || serviceForm.value.name.length < 3 ||
      !serviceForm.value.description || serviceForm.value.description.length > 250) {
    errorMessage.value = t('manage-services.create-form-error');
    return;
  }
  const exists = catalogStore.services.some(
      s => s.name.toLowerCase().trim() === serviceForm.value.name.toLowerCase().trim()
  );
  if (exists) {
    errorMessage.value = t('manage-services.service-already-exists');
    return;
  }

  try {
    const createdService = await catalogStore.addService(serviceForm.value);
    recentlyCreatedService.value = createdService;
    isFilteringByRecent.value = true;

    serviceForm.value.name = '';
    serviceForm.value.description = '';

    successMessage.value = t('manage-services.service-created-success');
    setTimeout(() => successMessage.value = null, 3000);
  } catch (err) {
    console.error(err);
    if (err.response?.status === 409) {
      errorMessage.value = t('manage-services.service-already-exists');
    } else {
      errorMessage.value = t('manage-services.create-form-error');
    }
  }
}

function onConfigureOffer(serviceId) {
  if (isLoading.value) return;
  router.push(`/layout-workshop/auto-repair-catalog/offer-form/${serviceId}`);
}

async function onDeleteService(serviceId) {
  if (isLoading.value) return;
  if (!confirm(t('manage-services.confirm-delete'))) return;

  try {
    await catalogStore.deleteService(serviceId); 
    if (recentlyCreatedService.value?.id === serviceId) recentlyCreatedService.value = null;
    selectedServiceId.value = null;

    successMessage.value = t('manage-services.service-deleted-success');
    setTimeout(() => successMessage.value = null, 3000);
  } catch (err) {
    console.error(err);
    errorMessage.value = t('manage-services.delete-error'); 
  }
}

function onToggleServiceView() {
  if (isFilteringByRecent.value) {
    isFilteringByRecent.value = false;
    recentlyCreatedService.value = null;
  } else {
    isFilteringByRecent.value = true;
  }
}

function onBackToWorkshop() {
  router.push('/layout-workshop/auto-repair-register/manage-auto-repair');
}

</script>

<template>
  <div class="service-container">
    <div class="form-header">
      <h1 class="page-title">{{ $t('manage-services.service-title') }}</h1>
    </div>

    <div v-if="errorMessage" class="notification-message error-message">
      <span>✕ {{ errorMessage }}</span>
    </div>
    <div v-if="successMessage" class="notification-message success-message">
      <span>✓ {{ successMessage }}</span>
    </div>

    <div class="content-layout">
      <div class="creation-column">
        <h2 class="section-title">{{ $t('manage-services.create-new') }}</h2>

        <form @submit.prevent="onCreateService" class="service-creation-form">
          <div class="form-card">

            <div class="form-group">
              <label class="form-label" for="serviceName">{{ $t('manage-services.service-name') }}</label>
              <input
                  id="serviceName"
                  type="text"
                  class="form-input"
                  v-model="serviceForm.name"
                  :placeholder="$t('manage-services.name-placeholder')"
                  required
                  minlength="3"
              />
              <span v-if="serviceForm.name && serviceForm.name.length < 3" class="error-message">
                {{ $t('manage-services.name-required') }}
              </span>
            </div>

            <div class="form-group">
              <label class="form-label" for="serviceDescription">{{ $t('manage-services.service-description') }}</label>
              <textarea
                  id="serviceDescription"
                  class="form-input form-textarea"
                  v-model="serviceForm.description"
                  :placeholder="$t('manage-services.description-placeholder')"
                  rows="4"
                  required
                  maxlength="250"
              ></textarea>
              <span v-if="serviceForm.description && serviceForm.description.length > 250" class="error-message">
                {{ $t('manage-services.description-required') }}
              </span>
            </div>

          </div>

          <button type="submit" class="submit-btn" :disabled="!serviceForm.name || !serviceForm.description || isLoading">
            {{ $t('manage-services.create-service-btn') }}
          </button>
        </form>
      </div>

      <div class="list-column">
        <h2 class="section-title">
          {{ isFilteringByRecent ? $t('manage-services.recently-created') : $t('manage-services.existing-services') }}
        </h2>

        <div v-if="displayedServices.length === 0 && !isLoading" class="empty-state">
          {{ $t('manage-services.no-services-yet') }}
        </div>

        <div v-if="isLoading" class="loading-state">
          {{ $t('general.loading') }}...
        </div>

        <div class="service-list">
          <div
              v-for="service in displayedServices"
              :key="service.id"
              class="service-item"
              :class="{ selected: selectedServiceId === service.id }"
              @click="selectedServiceId = service.id"
          >
            <div class="service-header">
              <span class="service-name">({{ service.service_id }}) {{ service.name }}</span>
              <span
                  class="status-badge"
                  :class="hasOffer(service.id) ? 'status-configured' : 'status-pending'"
              >
                {{ hasOffer(service.id) ? $t('manage-services.configured') : $t('manage-services.pending') }}
              </span>
            </div>

            <div v-if="selectedServiceId === service.id" class="service-details">
              <p>{{ service.description }}</p>

              <div class="service-actions">
                <button
                    type="button"
                    class="btn-delete"
                    :disabled="isLoading"
                    @click.stop="onDeleteService(service.id)"
                >
                  {{ $t('general.delete') }}
                </button>

                <button
                    type="button"
                    class="btn-next"
                    :disabled="isLoading"
                    @click.stop="onConfigureOffer(service.id)"
                >
                  {{ $t('manage-services.configure-offer-btn') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    <div class="form-actions bottom-actions">
      <button type="button" class="cancel-btn" @click="onBackToWorkshop">
        {{ $t('general.back-to-workshop') }}
      </button>

      <button type="button" class="btn-secondary" @click="onToggleServiceView" :disabled="isLoading">
        {{ isFilteringByRecent ? $t('general.view-all-services') : $t('general.view-recently-created') }}
      </button>
    </div>

  </div>
</template>

<style scoped>
.service-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 0;
}

.form-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-family: var(--font-bold);
  color: var(--color-primary);
  margin: 0;
}

.content-layout {
  display: flex;
  gap: 2rem;
}

.creation-column {
  flex: 1;
  min-width: 350px;
}

.list-column {
  flex: 1.5;
  min-width: 400px;
}

.service-creation-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}


.section-title {
  font-size: 1.5rem;
  font-family: var(--font-bold);
  color: var(--color-dark);
  margin: 0 0 1rem 0;
  border-bottom: 2px solid var(--p-gray-50);
  padding-bottom: 0.5rem;
}

.form-card {
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 1rem;
  font-family: var(--font-semibold);
  color: var(--color-dark);
  margin-bottom: 0.25rem;
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  font-family: var(--font-regular);
  color: var(--color-dark);
  background-color: var(--color-light);
  transition: border-color 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-input:invalid:not(:placeholder-shown),
.form-textarea:invalid:not(:placeholder-shown) {
  border-color: #dc3545;
}

.error-message {
  font-size: 0.875rem;
  color: #dc3545;
  font-family: var(--font-regular);
  margin-top: 0.25rem;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.service-item {
  background-color: var(--color-light);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.service-item:hover {
  border-color: var(--color-light);
}

.service-item.selected {
  border-color: var(--color-primary);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.service-name {
  font-family: var(--font-semibold);
  font-size: 1.1rem;
  color: var(--color-dark);
}

.status-badge {
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-family: var(--font-bold);
}

.status-configured {
  background-color: #d4edda;
  color: #155724;
}

.status-pending {
  background-color: #ffeeba;
  color: #856404;
}

.service-details {
  padding: 0 1rem 1rem 1rem;
  border-top: 1px solid #eee;
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.service-details p {
  font-size: 0.95rem;
  color: var(--color-primary);
  margin: 0;
}

.btn-next {
  background-color: var(--color-primary);
  color: var(--color-light);
  border: none;
  border-radius: 25px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-family: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-end;
}

.btn-delete{
  background-color: #e6991a;
  color: var(--color-light);
  border: none;
  border-radius: 25px;
  padding: 0.5rem 1.25rem;
  font-size: 0.9rem;
  font-family: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
  align-self: flex-end;
}

.btn-next:hover {
  background-color: #e6991a;
}

.btn-next:disabled {
  background-color: #e6991a;
  cursor: not-allowed;
  opacity: 0.6;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-dark);
  font-style: italic;
}

.notification-message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-family: var(--font-medium);
  font-size: 1rem;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-message.notification-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding-top: 1rem;
}

.cancel-btn,
.submit-btn,
.btn-secondary{
  border: none;
  border-radius: 25px;
  padding: 0.875rem 2.5rem;
  font-size: 1rem;
  font-family: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 140px;
}

.cancel-btn {
  background-color: #6c757d;
  color: var(--color-light);
}

.btn-secondary{
  background-color: #e6991a;
  color: var(--color-light);
}

.cancel-btn:hover {
  background-color: #5a6268;
}

.btn-secondary:hover {
  background-color: var(--color-first-complementary);
  color: var(--color-light);
}

.submit-btn { 
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  align-self: flex-start;
}

.submit-btn:hover:not(:disabled) {
  background-color: #e6991a;
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

@media (max-width: 992px) {
  .content-layout {
    flex-direction: column;
    gap: 3rem;
  }

  .creation-column,
  .list-column {
    min-width: 100%;
    flex: 1;
  }
}

@media (max-width: 768px) {
  
  .page-title {
    font-size: 2rem;
    text-align: center;
  }

  .form-card {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }

  .submit-btn {
    align-self: unset;
  }
}

@media (max-width: 480px) {
  
  .page-title {
    font-size: 1.5rem;
  }

  .form-card {
    padding: 1rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .form-input,
  .form-textarea {
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
  }

  .cancel-btn,
  .submit-btn {
    padding: 0.75rem 2rem;
    font-size: 0.9rem;
  }
}

</style>