<script setup>
import {ref, reactive, computed, onMounted} from 'vue';
import useIamStore from '@/iam/application/iam.store.js';
import usePaymentStore from "@/payment-service/application/payment-service.store.js";

// Stores
const iamStore = useIamStore();
const paymentsStore = usePaymentStore()
// Session user account
const sessionUserAccount = computed(() => iamStore.sessionUserAccount);

// UI state
const showPasswordFields = ref(false);
const showAddPaymentModal = ref(false);
const showNewPassword = ref(false);
const showRepeatPassword = ref(false);

// Payments filtered by session user account ID
const paymentByUserAccountId = computed(() => {
  const userAccount = sessionUserAccount.value;
  if (!userAccount) return [];
  return paymentsStore.payments.filter(p => p.user_account_id === userAccount.id);
});

// Subscription info based on membership
const subscriptionInfo = computed(() => {
  const userAccount = sessionUserAccount.value;
  if (!userAccount) return null;

  const membershipId = userAccount.membership_id;
  let months = 0;
  let price = '0.00';

  if (membershipId === 1) { months = 1; price = '39.00'; }
  else if (membershipId === 2) { months = 3; price = '99.00'; }
  else if (membershipId === 3) { months = 12; price = '349.00'; }

  return { months, price };
});

// Password form
const passwordForm = reactive({
  newPassword: '',
  repeatPassword: ''
});

const passwordErrors = reactive({
  newPassword: null,
  repeatPassword: null
});

const validatePasswordForm = () => {
  passwordErrors.newPassword = passwordForm.newPassword.length < 6 ? 'Mínimo 6 caracteres' : null;
  passwordErrors.repeatPassword = passwordForm.repeatPassword.length < 6 ? 'Mínimo 6 caracteres' : null;
  return !Object.values(passwordErrors).some(e => e);
};

// Payment form
const paymentForm = reactive({
  card_number: 0,
  month: 1,
  year: new Date().getFullYear(),
  cvv: 0,
  card_type: 'Visa'
});

const paymentErrors = reactive({
  card_number: null,
  month: null,
  year: null,
  cvv: null,
  card_type: null
});

const validatePaymentForm = () => {
  paymentErrors.card_number = !paymentForm.card_number ? 'Requerido' : null;
  paymentErrors.month = !paymentForm.month ? 'Requerido' : null;
  paymentErrors.year = !paymentForm.year ? 'Requerido' : null;
  paymentErrors.cvv = !paymentForm.cvv ? 'Requerido' : null;
  paymentErrors.card_type = !paymentForm.card_type ? 'Requerido' : null;
  return !Object.values(paymentErrors).some(e => e);
};

// Months and years
const months = [
  { value: 1, name: 'Enero' }, { value: 2, name: 'Febrero' }, { value: 3, name: 'Marzo' },
  { value: 4, name: 'Abril' }, { value: 5, name: 'Mayo' }, { value: 6, name: 'Junio' },
  { value: 7, name: 'Julio' }, { value: 8, name: 'Agosto' }, { value: 9, name: 'Septiembre' },
  { value: 10, name: 'Octubre' }, { value: 11, name: 'Noviembre' }, { value: 12, name: 'Diciembre' }
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

// Methods

const onSavePassword = () => {
  if (!validatePasswordForm()) return;
  if (passwordForm.newPassword !== passwordForm.repeatPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }
  console.log('Cambiar contraseña:', passwordForm.newPassword);
  passwordForm.newPassword = '';
  passwordForm.repeatPassword = '';
  showPasswordFields.value = false;
};

const onDeletePayment = (paymentId) => {
  if (confirm('¿Está seguro de eliminar este método de pago?')) {
    iamStore.deletePayment(paymentId);
  }
};

const onAddPaymentMethod = () => {
  showAddPaymentModal.value = true;
};

const onClosePaymentModal = () => {
  showAddPaymentModal.value = false;
  paymentForm.card_number = 0;
  paymentForm.month = 1;
  paymentForm.year = new Date().getFullYear();
  paymentForm.cvv = 0;
  paymentForm.card_type = 'Visa';
};

const onSubmitPayment = () => {
  if (!validatePaymentForm()) return;
  console.log('Añadir método de pago:', { ...paymentForm });
  onClosePaymentModal();
};

const onRenewSubscription = () => {
  console.log('Renovar suscripción');
};

const getCardBrand = (cardNumber) => {
  const firstDigit = cardNumber.toString()[0];
  if (firstDigit === '4') return 'Visa';
  if (firstDigit === '5') return 'Mastercard';
  return 'Desconocido';
};

const formatCardNumber = (cardNumber) => {
  return cardNumber.toString().replace(/(\d{4})/g, '$1 ').trim();
};

onMounted(async () => {
  await iamStore.fetchUserAccounts();// o cómo cargues el usuario
  await paymentsStore.fetchPayments(); // carga los pagos desde el backend
  await iamStore.fetchUsers()
});
</script>

<template>
  <div class="settings-container">
    <h1 class="settings-title">{{ $t('settings-view.title') }}</h1>

    <!-- Change Password Section -->
    <section class="settings-section">
      <h2 class="section-title">{{ $t('settings-view.changePassword') }}</h2>

      <form @submit.prevent="onSavePassword" class="password-form">
        <div class="form-row">
          <div class="form-group">
            <label for="newPassword" class="form-label">{{ $t('settings-view.newPassword') }}</label>
            <div class="password-input-wrapper">
              <input
                  :type="showNewPassword ? 'text' : 'password'"
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  class="form-input"
                  placeholder="************"
              />
              <button type="button" class="toggle-password-btn" @click="showNewPassword = !showNewPassword">
                <svg class="icon-eye" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="repeatPassword" class="form-label">{{ $t('settings-view.repeatPassword') }}</label>
            <div class="password-input-wrapper">
              <input
                  :type="showRepeatPassword ? 'text' : 'password'"
                  id="repeatPassword"
                  v-model="passwordForm.repeatPassword"
                  class="form-input"
                  placeholder="************"
              />
              <button type="button" class="toggle-password-btn" @click="showRepeatPassword = !showRepeatPassword">
                <svg class="icon-eye" width="24" height="24" viewBox="0 0 24 24">
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <button type="submit" class="btn-save">{{ $t('settings-view.savePassword') }}</button>
      </form>
    </section>

    <!-- Payment Methods Section -->
    <section class="settings-section">
      <h2 class="section-title">{{ $t('settings-view.paymentMethods') }}</h2>

      <div class="payment-methods-list">
        <div v-for="payment in paymentByUserAccountId" :key="payment.id" class="payment-card">
          <div class="payment-info">
            <p class="payment-bank">{{ $t('settings-view.bank') }}: {{ getCardBrand(payment.card_number) }}</p>
            <p class="payment-number">{{ $t('settings-view.cardNumber') }}: {{ formatCardNumber(payment.card_number) }}</p>
            <p class="payment-expiry">{{ $t('settings-view.expirationDate') }}: {{ payment.month }}/{{ payment.year }}</p>
          </div>
          <button class="btn-delete" @click="onDeletePayment(payment.id)">
            {{ $t('settings-view.deletePaymentMethod') }}
          </button>
        </div>

        <p v-if="paymentByUserAccountId.length === 0" class="no-payments">No hay métodos de pago registrados</p>
      </div>

      <button class="btn-add-payment" @click="onAddPaymentMethod">{{ $t('settings-view.addPaymentMethod') }}</button>
    </section>

    <!-- Subscription Section -->
    <section class="settings-section" v-if="subscriptionInfo">
      <h2 class="section-title">{{ $t('settings-view.subscription') }}</h2>

      <div class="subscription-card">
        <p class="subscription-plan">{{ $t('settings-view.plan', { months: subscriptionInfo.months }) }}</p>
        <p class="subscription-cost">{{ $t('settings-view.cost', { price: subscriptionInfo.price }) }}</p>
      </div>

      <button class="btn-renew" @click="onRenewSubscription">{{ $t('settings-view.renewSubscription') }}</button>
    </section>

    <!-- Payment Modal -->
    <div v-if="showAddPaymentModal" class="modal-overlay" @click="onClosePaymentModal">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ $t('settings-view.addPaymentMethod') }}</h2>

        <form @submit.prevent="onSubmitPayment" class="modal-form">
          <div class="form-row">
            <div class="form-group">
              <label for="cardNumber" class="form-label">{{ $t('payment.cardNumber') }}</label>
              <input type="number" id="cardNumber" v-model.number="paymentForm.card_number" class="form-input" placeholder="1149849846611161" />
            </div>

            <div class="form-group">
              <label for="cardType" class="form-label">{{ $t('payment.cardType') }}</label>
              <input type="text" id="cardType" v-model="paymentForm.card_type" class="form-input" placeholder="Visa/Mastercard" />
            </div>
          </div>

          <div class="form-row three-columns">
            <div class="form-group">
              <label for="month" class="form-label">{{ $t('payment.month') }}</label>
              <select id="month" v-model.number="paymentForm.month" class="form-select">
                <option v-for="m in months" :key="m.value" :value="m.value">{{ m.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="year" class="form-label">{{ $t('payment.year') }}</label>
              <select id="year" v-model.number="paymentForm.year" class="form-select">
                <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
              </select>
            </div>

            <div class="form-group">
              <label for="cvv" class="form-label">{{ $t('payment.cvv') }}</label>
              <input type="number" id="cvv" v-model.number="paymentForm.cvv" class="form-input" placeholder="333" />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-cancel" @click="onClosePaymentModal">Cancelar</button>
            <button type="submit" class="btn-submit">{{ $t('settings-view.addPaymentMethod') }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
  max-width: 1400px;
}

.settings-title {
  font-family: var(--font-bold), sans-serif;
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0 0 2rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

/* Settings Sections */
.settings-section {
  margin-bottom: 3rem;
  background-color: var(--color-light);
  border-radius: 12px;
}

.section-title {
  font-family: var(--font-semibold), sans-serif;
  font-size: 1.5rem;
  color: var(--color-dark);
  margin-bottom: 1.5rem;
}

/* Password Form */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-row.three-columns {
  grid-template-columns: 1fr 1fr 1fr;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-medium), sans-serif;
  font-size: 1rem;
  color: var(--color-dark);
}

.form-input,
.form-select {
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-primary);
  border-radius: 25px;
  font-family: var(--font-regular), sans-serif;
  font-size: 1rem;
  color: var(--color-dark);
  background-color: var(--color-light);
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 3px rgba(242, 170, 31, 0.1);
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  flex: 1;
  padding-right: 3rem;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.toggle-password-btn:hover {
  transform: scale(1.1);
}

.icon-eye {
  width: 24px;
  height: 24px;
  fill: var(--color-primary);
}

.btn-save {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
  align-self: flex-start;
}

.btn-save:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

/* Payment Methods */
.payment-methods-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.payment-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.payment-bank,
.payment-number,
.payment-expiry {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
}

.payment-bank {
  font-family: var(--font-semibold);
}

.btn-delete {
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

.btn-delete:hover {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

.no-payments {
  text-align: center;
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  padding: 2rem;
}

.btn-add-payment {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
}

.btn-add-payment:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

/* Subscription Section */
.subscription-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
}

.subscription-plan,
.subscription-cost {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
}

.subscription-plan {
  font-family: var(--font-semibold);
  font-size: 1.1rem;
}

.btn-renew {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.875rem 2rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
  align-self: flex-start;
}

.btn-renew:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
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
  background-color: var(--color-light);
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-family: var(--font-bold), sans-serif;
  font-size: 1.8rem;
  color: var(--color-primary);
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

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
  .settings-container {
    padding: 1rem;
  }

  .settings-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-row.three-columns {
    grid-template-columns: 1fr;
  }

  .payment-card {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .btn-delete,
  .btn-add-payment,
  .btn-save,
  .btn-renew {
    width: 100%;
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