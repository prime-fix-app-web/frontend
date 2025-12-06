<script setup>
import { ref } from "vue";
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

// Funciones/acciones mediante destructuración directa
const {
  addPayment,
} = paymentStore;

// ID del usuario actual
const idUserAccount = sessionUserAccount.value?.id ?? null;

// Datos del formulario
const form = ref({
  card_number: "",
  card_type: null,
  month: null,
  year: null,
  cvv: ""
});

// Opciones para los selects
const months = [
  { label: "Enero", value: 1 }, { label: "Febrero", value: 2 },
  { label: "Marzo", value: 3 }, { label: "Abril", value: 4 },
  { label: "Mayo", value: 5 }, { label: "Junio", value: 6 },
  { label: "Julio", value: 7 }, { label: "Agosto", value: 8 },
  { label: "Septiembre", value: 9 }, { label: "Octubre", value: 10 },
  { label: "Noviembre", value: 11 }, { label: "Diciembre", value: 12 }
];
const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
const cardTypes = [
  { label: "Débito", value: "Débito" },
  { label: "Crédito", value: "Crédito" }
];

// Guardar método de pago
async function submitPayment() {
  if (!form.value.card_number || !form.value.card_type || !form.value.month || !form.value.year || !form.value.cvv) {
    alert("Por favor completa todos los campos antes de continuar.");
    return;
  }

  const newPayment = {
    id: "PY" + Math.floor(Math.random() * 1000),
    card_number: form.value.card_number,
    card_type: form.value.card_type,
    month: form.value.month,
    year: form.value.year,
    cvv: form.value.cvv,
    user_account_id: idUserAccount
  };

  try {
    await addPayment(newPayment);
    alert("Método de pago añadido correctamente ✅");
    router.push("/layout-vehicle-owner/payment-service/payment/select");
  } catch (error) {
    console.error("❌ Error al añadir método de pago:", error);
  }
}
</script>

<template>
  <div class="p-6 flex flex-column align-items-center justify-content-start bg-white min-h-screen overflow-auto">
    <h2 class="text-3xl font-bold text-primary mb-5">Añadir método de pago</h2>

    <pv-card class="w-full max-w-lg shadow-3 border-round-lg surface-50 p-5">
      <div class="grid formgrid p-fluid text-left">
        <!-- Número de tarjeta -->
        <div class="field col-12 md:col-6">
          <label for="card_number" class="text-700 mb-2 block">Número de la tarjeta</label>
          <pv-input-text id="card_number" v-model="form.card_number" placeholder="Ej: 4111111111111111" />
        </div>

        <!-- Tipo de tarjeta -->
        <div class="field col-12 md:col-6">
          <label for="card_type" class="text-700 mb-2 block">Tipo de tarjeta</label>
          <pv-dropdown id="card_type" v-model="form.card_type" :options="cardTypes" optionLabel="label" optionValue="value" placeholder="Seleccionar" />
        </div>

        <!-- Mes -->
        <div class="field col-12 md:col-4">
          <label for="month" class="text-700 mb-2 block">Mes</label>
          <pv-dropdown id="month" v-model="form.month" :options="months" optionLabel="label" optionValue="value" placeholder="Mes" />
        </div>

        <!-- Año -->
        <div class="field col-12 md:col-4">
          <label for="year" class="text-700 mb-2 block">Año</label>
          <pv-dropdown id="year" v-model="form.year" :options="years" placeholder="Año" />
        </div>

        <!-- CVV -->
        <div class="field col-12 md:col-4">
          <label for="cvv" class="text-700 mb-2 block">CVV</label>
          <pv-input-text id="cvv" v-model="form.cvv" maxlength="3" placeholder="123" />
        </div>
      </div>

      <!-- Botón -->
      <div class="flex justify-content-center mt-5">
        <pv-button label="Añadir" severity="warning" rounded class="w-10rem" @click="submitPayment" />
      </div>
    </pv-card>
  </div>
</template>

<style scoped>
.text-primary {
  color: #004d5a;
}
.text-700 {
  color: #334155;
}
</style>
