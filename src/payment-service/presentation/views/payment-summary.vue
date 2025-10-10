<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useIamStore from "@/iam/application/iam.store.js";
import usePaymentServiceStore from "@/payment-service/application/payment-service.store.js";

const router = useRouter();
const iamStore = useIamStore();
const paymentServiceStore = usePaymentServiceStore();

// Restaurar sesión y cargar datos
onMounted(() => {
  iamStore.loadSessionFromStorage();
  paymentServiceStore.fetchVehicles();
  paymentServiceStore.fetchVisits();
});

// IDs de prueba (mock)
const vehicleId = ref("RV002");
const visitId = ref("V001");

// Obtener datos del usuario actual
const user = computed(() => iamStore.sessionUser);
const userAccount = computed(() => iamStore.sessionUserAccount);

// Buscar vehículo y visita
const vehicle = computed(() => paymentServiceStore.getVehicleById(vehicleId.value));
const visit = computed(() => paymentServiceStore.getVisitById(visitId.value));

// Método de pago seleccionado
const paymentMethod = ref("");

// Manejar la selección de pago
function proceedToPayment() {
  if (!paymentMethod.value) {
    alert("Selecciona un método de pago antes de continuar.");
    return;
  }
  if (paymentMethod.value == 'Pago Virtual') {
    console.log(`Método seleccionado: ${paymentMethod.value}`);
    router.push("/layout-owner/payment-service/payment/select");
  }
  else if (paymentMethod.value == 'Efectivo') {
    console.log(`Método seleccionado: ${paymentMethod.value}`);
    router.push("/layout-owner/payment-service/payment/done");
  }

}
</script>

<template>
  <div class="p-5 flex justify-center">
    <pv-card class="w-full max-w-md shadow-3 border-round-lg">
      <template #title>
        <div class="text-center text-xl font-bold text-primary">
          Detalles del Pago
        </div>
      </template>

      <template #content>
        <div class="flex flex-column gap-3">
          <div class="p-3 border-round surface-100">
            <h3 class="text-lg font-semibold text-700 mb-2">🚗 Vehículo</h3>
            <p><strong>Marca:</strong> {{ vehicle?.vehicle_brand || 'N/A' }}</p>
          </div>

          <div class="p-3 border-round surface-100">
            <h3 class="text-lg font-semibold text-700 mb-2">📋 Visita</h3>
            <p><strong>Placa:</strong> {{ vehicle?.vehicle_plate || 'N/A' }}</p>
            <p><strong>Falla:</strong> {{ visit?.failure || 'N/A' }}</p>
            <p><strong>Status:</strong> {{ visit?.status || 'N/A' }}</p>
          </div>

          <div class="p-3 border-round surface-100">
            <h3 class="text-lg font-semibold text-700 mb-2">💳 Método de Pago</h3>

            <div class="flex flex-column gap-2">
              <pv-radio-button
                  inputId="efectivo"
                  name="payment"
                  value="Efectivo"
                  v-model="paymentMethod"
              />
              <label for="efectivo">Efectivo</label>

              <pv-radio-button
                  inputId="virtual"
                  name="payment"
                  value="Pago Virtual"
                  v-model="paymentMethod"
              />
              <label for="virtual">Pago Virtual</label>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end">
          <pv-button
              label="Continuar"
              icon="pi pi-arrow-right"
              :disabled="!paymentMethod"
              @click="proceedToPayment"
          />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.text-primary {
  color: var(--color-primary);
}
</style>
