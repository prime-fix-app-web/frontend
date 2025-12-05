<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import useIamStore from "@/iam/application/iam.store.js";
import usePaymentServiceStore from "@/payment-service/application/payment-service.store.js";

const router = useRouter();
const iamStore = useIamStore();
const paymentStore = usePaymentServiceStore();

// Valores reactivos usando storeToRefs
const {
  sessionUserAccount,
} = storeToRefs(iamStore);

const {
  payments,
  paymentsLoaded,
} = storeToRefs(paymentStore);

// Funciones/acciones mediante destructuración directa
const {
  fetchPayments,
} = paymentStore;

const selectedPayment = ref(null);
const idUserAccount = sessionUserAccount.value?.id ?? null;

// Cargar los pagos del usuario logeado
onMounted(() => {
  if (!paymentsLoaded.value) fetchPayments();
});

// Filtrar los métodos del usuario actual
const userPayments = computed(() =>
    payments.value.filter(p => p.user_account_id === idUserAccount)
);

// Opciones para el combobox
const paymentOptions = computed(() =>
    userPayments.value.map(payment => ({
      label: `**** **** **** ${String(payment.card_number).slice(-4)} (${payment.card_type})`,
      value: payment.id
    }))
);

// Navegación
function goBack() {
  router.push("/layout-vehicle-owner/payment-service/payment");
}

function goToAddMethod() {
  router.push("/layout-vehicle-owner/payment-service/payment/select/form");
}

function goToPay() {
  if (!selectedPayment.value) {
    alert("Por favor selecciona un método de pago antes de continuar.");
    return;
  }
  router.push("/layout-vehicle-owner/payment-service/payment/done");
}
</script>

<template>
  <div class="payment-container">
    <!-- Subtítulo -->
    <p class="payment-title">Pago a realizar</p>

    <!-- Tarjeta -->
    <pv-card class="payment-card">
      <template #title>
        <h2 class="payment-card-title">Elegir método</h2>
      </template>

      <template #content>
        <div class="text-left mb-3">
          <label class="block text-700 mb-2">Método</label>
          <pv-dropdown
              v-model="selectedPayment"
              :options="paymentOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un método"
              class="payment-dropdown"
          />
        </div>

        <div class="payment-buttons">
          <pv-button label="Volver" rounded severity="secondary" class="btn-secondary" @click="goBack" />
          <!-- ><pv-button label="Añadir método" rounded severity="warning" class="btn-warning" @click="goToAddMethod" />
          </-->
          <pv-button label="Pagar" rounded severity="warning" class="btn-warning" @click="goToPay" />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
/* === Contenedor principal === */
.payment-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: white;
  color: black;
}

/* === Texto superior === */
.payment-title {
  margin-bottom: 1.5rem;
  font-size: 1.125rem;
  color: #374151;
  font-weight: 500;
}

/* === Tarjeta === */
.payment-card {
  background-color: var(--color-second-complementary);
  color: #090909;
  border-radius: 1rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  border: 1px solid #e5e7eb;
  text-align: center;
}

.payment-card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1.5rem;
}

/* === Sección del dropdown === */
:deep(.payment-dropdown-section) {
  text-align: left;
  margin-bottom: 1.5rem;
}

.payment-label {
  display: block;
  color: #374151;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.payment-dropdown {
  width: 100%;
  color: #090909;
}

/* === Botones === */
.payment-buttons {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1rem;
}

/* === Estilos personalizados de botones === */
:deep(.btn-secondary.p-button) {
  background-color: var(--color-first-complementary) !important;
  color: #111827 !important;
  border: none !important;
  width: 8rem;
  transition: all 0.2s ease;
}
:deep(.btn-warning.p-button) {
  background-color: var(--color-first-complementary) !important;
  color: #000 !important;
  border: none !important;
}
.btn-warning:nth-child(2) {
  width: 10rem;
}
.btn-warning:hover {
  filter: brightness(0.95);
}
</style>
