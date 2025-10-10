<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useIamStore from "@/iam/application/iam.store.js";
import usePaymentServiceStore from "@/payment-service/application/payment-service.store.js";

const router = useRouter();
const iamStore = useIamStore();
const paymentStore = usePaymentServiceStore();

const selectedPayment = ref(null);
const idUserAccount = iamStore.sessionUserAccount?.id ?? null;

// Cargar los pagos del usuario logeado
onMounted(() => {
  if (!paymentStore.paymentsLoaded) paymentStore.fetchPayments();
});

// Filtrar los métodos del usuario actual
const userPayments = computed(() =>
    paymentStore.payments.filter(p => p.id_user_account === idUserAccount)
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
  router.push("/layout-owner/payment-service/payment");
}

function goToAddMethod() {
  router.push("/layout-owner/payment-service/payment/select/form");
}

function goToPay() {
  if (!selectedPayment.value) {
    alert("Por favor selecciona un método de pago antes de continuar.");
    return;
  }
  router.push("/layout-owner/payment-service/payment/done");
}
</script>

<template>
  <div class="flex flex-column align-items-center justify-content-center h-screen bg-white">
    <!-- Subtítulo -->
    <p class="text-600 mb-4 text-lg">Pago a realizar</p>

    <!-- Tarjeta -->
    <pv-card class="w-full max-w-md shadow-3 border-round-lg surface-50 p-5 text-center">
      <template #title>
        Elegir método
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
              class="w-full"
          />
        </div>

        <div class="flex justify-content-center gap-3 mt-4">
          <pv-button label="Volver" rounded severity="secondary" class="w-8rem" @click="goBack" />
          <pv-button label="Añadir método" rounded severity="warning" class="w-10rem" @click="goToAddMethod" />
          <pv-button label="Pagar" rounded severity="warning" class="w-8rem" @click="goToPay" />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.text-600 {
  color: #475569;
}
.text-700 {
  color: #334155;
}
</style>
