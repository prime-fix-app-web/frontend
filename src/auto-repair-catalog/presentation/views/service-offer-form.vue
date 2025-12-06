<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const catalogStore = useCatalogStore();
const iamStore = useIamStore();
const { t } = useI18n();

const isLoading = computed(() => catalogStore.loading);
const errorMessage = ref(null);
const successMessage = ref(null);

const serviceId = ref(null);
const currentService = ref(null);

const offerForm = ref({
  price: null,
  duration: null
});

const autoRepairId = computed(() => {
  const autoRepair = catalogStore.getAutoRepairById(iamStore.sessionUserAccountId);
  return autoRepair?.id || null;
});

watch([autoRepairId, serviceId], ([autoRepair, sId]) => {
  if (autoRepair && sId) {
    catalogStore.fetchServiceOffers(autoRepair);
    errorMessage.value = null;
  } else if (iamStore.sessionUserAccount && !autoRepair && !iamStore.loading) {
    errorMessage.value = t('service-offer.no-auto-repair-associated-error');
  }
});

watch([isLoading, () => catalogStore.errors], ([loading, errors]) => {
  if (!loading) {
    if (errors && errors.length > 0) {
      errorMessage.value = errors[0];
      successMessage.value = null;
    } else if (successMessage.value) {
      setTimeout(() => onBackToServiceList(), 1500);
    }
  }
});

onMounted(async () => {
  const rawId = route.params.id;
  console.log('[ServiceOfferForm] Route params.id:', rawId);

  // Validate the ID from route params
  if (!rawId || rawId === 'null' || rawId === 'undefined' || rawId === '0') {
    console.error('[ServiceOfferForm] Invalid service ID from route:', rawId);
    errorMessage.value = t('service-offer.service-not-found') || 'Invalid service ID. Redirecting...';
    setTimeout(() => onBackToServiceList(), 2000);
    return;
  }

  serviceId.value = rawId;
  console.log('[ServiceOfferForm] Looking for service with ID:', serviceId.value);

  // Ensure services are loaded
  await catalogStore.fetchServices();

  currentService.value = catalogStore.getServiceById(serviceId.value);
  console.log('[ServiceOfferForm] Found service:', currentService.value);

  if (!currentService.value) {
    console.error('[ServiceOfferForm] Service not found in catalog for ID:', serviceId.value);
    errorMessage.value = t('service-offer.service-not-found') || 'Service not found';
  }
});

async function onCreateOrUpdateOffer() {
  errorMessage.value = null;
  successMessage.value = null;

  const currentAutoRepairId = autoRepairId.value;

  if (!offerForm.value.price || !offerForm.value.duration || !serviceId.value || !currentAutoRepairId) {
    errorMessage.value = !currentAutoRepairId
        ? t('service-offer.no-auto-repair-associated-error')
        : t('service-offer.form-validation-error');
    return;
  }

  const serviceOffer = {
    service_id: serviceId.value,
    auto_repair_id: currentAutoRepairId,
    price: offerForm.value.price,
    duration_hour: offerForm.value.duration,
    is_active: true
  };

  try {
    await catalogStore.addServiceOffer(currentAutoRepairId, serviceOffer);
    successMessage.value = t('service-offer.save-success');

    
    offerForm.value.price = null;
    offerForm.value.duration = null;
  } catch (err) {
    console.error(err);
    errorMessage.value = t('service-offer.save-error');
  }
}

function onBackToServiceList() {
  router.push('/layout-workshop/auto-repair-catalog/service-form');
}
</script>

<template>
  <div class="offer-config-container">
    <div class="form-header">
      <h1 class="page-title">{{ t('service-offer.title') }}</h1>
    </div>

    <div v-if="errorMessage" class="notification-message error-message">
      ✕ {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="notification-message success-message">
      ✓ {{ successMessage }}
    </div>

    <div v-if="currentService" class="service-context-card">
      <h2 class="section-title">{{ t('service-offer.configuring-for') }}</h2>
      <p><strong>({{ currentService.id }}) {{ currentService.name }}</strong></p>
      <p>{{ currentService.description }}</p>
    </div>

    <form class="offer-creation-form" @submit.prevent="onCreateOrUpdateOffer">
      <div class="form-card">
        <div class="form-group">
          <label>{{ t('service-offer.price') }} (Soles/USD)</label>
          <input type="number" step="0.01" v-model.number="offerForm.price" class="form-input" />
        </div>
        <div class="form-group">
          <label>{{ t('service-offer.duration') }} (Horas)</label>
          <input type="number" step="1" v-model.number="offerForm.duration" class="form-input" />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="submit-btn">{{ t('service-offer.save-config-btn') }}</button>
        <button type="button" class="cancel-btn" @click="onBackToServiceList">{{ t('general.cancel') }}</button>
      </div>
    </form>
  </div>
</template>

<style scoped>

.offer-config-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 0;
  font-family: var(--font-regular);
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

.service-context-card {
  background-color: var(--color-light);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.service-context-card .section-title {
  font-size: 1.3rem;
  font-family: var(--font-semibold);
  color: var(--color-dark);
  margin: 0 0 0.5rem 0;
  padding-bottom: 0; 
}

.service-context-card .service-name-display strong {
  font-size: 1.1rem;
  color: var(--color-primary);
  font-family: var(--font-bold);
}

.service-context-card .service-description-display {
  font-size: 0.95rem;
  color: var(--color-primary);
  margin-top: 0.5rem;
}

.offer-creation-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.offer-creation-form .form-card {
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

.form-actions {
  display: flex;
  justify-content: flex-end; 
  gap: 1.5rem;
  padding-top: 1rem;
}

.cancel-btn,
.submit-btn {
  border: none;
  border-radius: 25px;
  padding: 0.875rem 2.5rem;
  font-size: 1rem;
  font-family: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
  min-width: 140px;
}

.submit-btn {
  background-color: var(--color-first-complementary);
  color: var(--color-light);
}

.submit-btn:hover:not(:disabled) {
  background-color: #e6991a; 
}

.submit-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.cancel-btn {
  background-color: #6c757d;
  color: var(--color-light);
}

.cancel-btn:hover {
  background-color: #5a6268;
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

@media (max-width: 768px) {
  .offer-config-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 1rem;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    min-width: unset;
  }

  .offer-creation-form .form-card {
    padding: 1.5rem;
  }
}

</style>