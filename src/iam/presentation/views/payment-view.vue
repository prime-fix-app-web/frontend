<script setup>
import {ref, computed, onMounted} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import useIamStore from "@/iam/application/iam.store.js";

const router = useRouter();
const { t } = useI18n();
const store = useIamStore();

const { registerUserAccount, finishRegister, resetRegistrationFlow,
  fetchUserAccounts, fetchPayments, fetchLocations, fetchUsers} = store;

/**
 * Months for the expiration date dropdown
 */
const months = [
  { value: 1, name: t('payment.january') },
  { value: 2, name: t('payment.february') },
  { value: 3, name: t('payment.march') },
  { value: 4, name: t('payment.april') },
  { value: 5, name: t('payment.may') },
  { value: 6, name: t('payment.june') },
  { value: 7, name: t('payment.july') },
  { value: 8, name: t('payment.august') },
  { value: 9, name: t('payment.september') },
  { value: 10, name: t('payment.october') },
  { value: 11, name: t('payment.november') },
  { value: 12, name: t('payment.december') }
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
const documentTypes = ['DNI', 'Pasaporte', 'Carné de Extranjería'];

/**
 * Determine the selected plan based on the user's membership
 * @type {ComputedRef<string>}
 */
const planSelected = computed(() => {

  if (!registerUserAccount) {
    return t('payment.oneMonthPlan');
  }

  const membershipId = registerUserAccount.id_membership;

  switch (membershipId) {
    case 'M001':
      return t('payment.threeMonthsPlan');
    case 'M002':
      return t('payment.twelveMonthsPlan');
    case 'M003':
      return t('payment.oneMonthPlan');
    default:
      return t('payment.oneMonthPlan');
  }
});

/**
 * Determine the amount to be paid based on the selected membership
 * @type {ComputedRef<string>}
 */
const amountSelected = computed(() => {
  if (!registerUserAccount) {
    console.log('❌ No userAccount or membership found, using default amount');
    return 'S/.19';
  }

  const membershipId = registerUserAccount.id_membership;
  console.log('💳 Membership ID for amount:', membershipId);

  switch (membershipId) {
    case 'M001':
      return 'S/.59';
    case 'M002':
      return 'S/.219';
    case 'M003':
      return 'S/.19';
    default:
      return 'S/.19';
  }
});

/**
  * Form state and validation
  */
const form = ref({
  card_number: '',
  month: 1,
  year: years[0],
  cvv: '',
  card_type: 'Visa',
  document_number: ''
});

/**
 * Error state
 * @type {Ref<UnwrapRef<Object>, UnwrapRef<Object> | Object>}
 */
const errors = ref({});

/**
 * Processing state to prevent multiple submissions
 * @type {Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>}
 */
const isProcessing = ref(false);


/**
 * Validate the form fields
 * @returns {boolean} - True if the form is valid, false otherwise
 */
function validateForm() {
  const e = {};
  if (!form.value.card_number) e.card_number = t('payment.cardNumberRequired');
  if (!form.value.card_type) e.card_type = t('payment.cardTypeRequired');
  if (!form.value.month) e.month = t('payment.monthRequired');
  if (!form.value.year) e.year = t('payment.yearRequired');
  if (!form.value.cvv) e.cvv = t('payment.cvvRequired');
  if (!form.value.document_number || form.value.document_number.length < 3)
    e.document_number = t('payment.documentNumberRequired');
  errors.value = e;
  return Object.keys(e).length === 0;
}

/**
 * Handle form submission
 * @async - This function is asynchronous
 * @returns {Promise<void>} - A promise that resolves when the submission is complete
 */
async function onSubmit() {
  if (!validateForm() || isProcessing.value) return;
  isProcessing.value = true;
  const formData = form.value;

  try {
    await finishRegister(formData);
    console.log(t('payment.successMessage'));

    /**
     * Fetch necessary data after registration to ensure the store is up-to-date
     */
    await fetchUserAccounts();
    await fetchUsers();
    await fetchLocations();
    await fetchPayments();

    goToLogin();
  } catch (error) {
    console.error(t('payment.failureMessage'), error);
    isProcessing.value = false;
  } finally {
    resetRegistrationFlow();
  }
}

/**
 * Navigate to the login page
 */
function goToLogin() {
  router.push('/iam/login');
}

</script>

<template>
  <div class="payment-container">
    <h1 class="payment-title">{{ $t('payment.title') }}</h1>

    <div class="payment-info">
      <p class="plan-info">{{ $t('payment.selectedPlan', { plan: planSelected }) }}</p>
      <p class="amount-info">{{ $t('payment.amountToPay', { amount: amountSelected }) }}</p>
    </div>

    <form class="payment-form" @submit.prevent="onSubmit">
      <div class="form-card">
        <div class="form-row two-columns">
          <div class="form-group">
            <label for="cardNumber" class="form-label">{{ $t('payment.cardNumber') }}</label>
            <input
                type="number"
                id="cardNumber"
                v-model="form.card_number"
                class="form-input"
                placeholder="1149849846611161"
                maxlength="16"
                :class="{ 'error': errors.card_number }"
            />
            <span v-if="errors.card_number" class="error-message">
              {{ errors.card_number }}
            </span>
          </div>
          <div class="form-group">
            <label for="cardType" class="form-label">{{ $t('payment.cardType') }}</label>
            <input
                type="text"
                id="cardType"
                v-model="form.card_type"
                class="form-input"
                placeholder="Visa/Mastercard"
                :class="{ 'error': errors.card_type }"
            />
            <span v-if="errors.card_type" class="error-message">
              {{ errors.card_type }}
            </span>
          </div>
        </div>

        <div class="form-row three-columns">
          <div class="form-group">
            <label for="month" class="form-label">{{ $t('payment.month') }}</label>
            <select id="month" v-model="form.month" class="form-select">
              <option v-for="month in months" :key="month.value" :value="month.value">{{ month.name }}</option>
            </select>
            <span v-if="errors.month" class="error-message">{{ errors.month }}</span>
          </div>
          <div class="form-group">
            <label for="year" class="form-label">{{ $t('payment.year') }}</label>
            <select id="year" v-model="form.year" class="form-select">
              <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
            </select>
            <span v-if="errors.year" class="error-message">{{ errors.year }}</span>
          </div>
          <div class="form-group">
            <label for="cvv" class="form-label">{{ $t('payment.cvv') }}</label>
            <input
                type="number"
                id="cvv"
                v-model="form.cvv"
                class="form-input"
                placeholder="333"
                maxlength="3"
                :class="{ 'error': errors.cvv }"
            />
            <span v-if="errors.cvv" class="error-message">
              {{ errors.cvv }}
            </span>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="documentType" class="form-label">{{ $t('payment.documentType') }}</label>
            <select id="documentType" class="form-select">
              <option v-for="docType in documentTypes" :key="docType" :value="docType">{{ docType }}</option>
            </select>
          </div>
          <div class="form-group">
            <label for="documentNumber" class="form-label">{{ $t('payment.documentNumber') }}</label>
            <input
                type="text"
                id="documentNumber"
                v-model="form.document_number"
                class="form-input"
                :class="{ 'error': errors.document_number }"
            />
            <span v-if="errors.document_number" class="error-message">
              {{ errors.document_number }}
            </span>
          </div>
        </div>
      </div>

      <button
          type="submit"
          class="payment-button"
          :disabled="isProcessing"
      >
        {{ isProcessing ? $t('payment.processing') : $t('payment.pay') }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.payment-container {
  min-height: 100vh;
  background: var(--color-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
}

.payment-title {
  color: var(--color-light);
  font-family: var(--font-bold);
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
}

.payment-info {
  color: var(--color-light);
  font-family: var(--font-regular);
  margin-bottom: 2rem;
  text-align: center;
}

.plan-info,
.amount-info {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.payment-form {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-card {
  background: var(--color-second-complementary);
  border-radius: 1.5rem;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  gap: 1.5rem;
}

.form-row.two-columns {
  grid-template-columns: repeat(2, 1fr);
}

.form-row.three-columns {
  grid-template-columns: repeat(3, 1fr);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: var(--color-dark);
  font-family: var(--font-medium);
  font-size: 0.95rem;
  font-weight: 500;
}

.form-input,
.form-select {
  background: var(--color-light);
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(17, 67, 88, 0.1);
}

.form-input[readonly] {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
}

.error-message {
  color: #ef4444;
  font-family: var(--font-regular);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.payment-button {
  background: var(--color-first-complementary);
  color: var(--color-light);
  border: none;
  border-radius: 2rem;
  padding: 1rem 3rem;
  font-family: var(--font-semibold);
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: center;
  min-width: 200px;
}

.payment-button:hover:not(:disabled) {
  background: #d99419;
  transform: scale(1.05);
}

.payment-button:active:not(:disabled) {
  transform: scale(0.98);
}

.payment-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-container {
    padding: 2rem 1rem;
  }

  .payment-title {
    font-size: 2rem;
  }

  .form-card {
    padding: 1.5rem;
  }

  .form-row.two-columns,
  .form-row.three-columns {
    grid-template-columns: 1fr;
  }

  .payment-info {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .payment-title {
    font-size: 1.75rem;
  }

  .form-card {
    padding: 1.25rem;
  }

  .payment-button {
    width: 100%;
  }
}


</style>