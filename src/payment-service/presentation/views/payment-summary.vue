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
    router.push("/layout-auto-repair-catalog/payment-service/payment/select");
  }
  else if (paymentMethod.value == 'Efectivo') {
    console.log(`Método seleccionado: ${paymentMethod.value}`);
    router.push("/layout-auto-repair-catalog/payment-service/payment/done");
  }

}
</script>

<template>
  <div class="card-wrapper">
    <pv-card class="custom-card">
      <template #title>
        <h2 class="card-title">
          Detalles del Pago
        </h2>
      </template>

      <template #content>
        <div class="flex flex-column gap-3">
          <div class="card-section">
            <h3 class="section-title">🚗 Vehículo</h3>
            <p><strong>Marca:</strong> {{ vehicle?.vehicle_brand || 'N/A' }}</p>
          </div>

          <div class="card-section">
            <h3 class="section-title">📋 Visita</h3>
            <p><strong>Placa:</strong> {{ vehicle?.vehicle_plate || 'N/A' }}</p>
            <p><strong>Falla:</strong> {{ visit?.failure || 'N/A' }}</p>
            <p><strong>Status:</strong> {{ visit?.status || 'N/A' }}</p>
          </div>

          <div class="card-section">
            <h3 class="section-title">💳 Método de Pago</h3>

            <div class="flex flex-column gap-2">
              <div class="flex align-items-center gap-2">
                <pv-radio-button
                    inputId="efectivo"
                    name="payment"
                    value="Efectivo"
                    v-model="paymentMethod"
                />
                <label for="efectivo">Efectivo</label>
              </div>

              <div class="flex align-items-center gap-2">
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
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end">
          <pv-button
              label="Continuar"
              icon="pi pi-arrow-right"
              class="accept-btn"
              :disabled="!paymentMethod"
              @click="proceedToPayment"
          />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.card-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 60px);
  background-color: #f6f7f9;
  padding: 2rem;
}

/* Carta con mismo estilo */
:deep(.custom-card) {
  background-color: var(--color-second-complementary) !important;
  color: #000000;
  border-radius: 16px !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08) !important;
  padding: 2rem 2.5rem !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  max-width: 500px !important;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease;
}

:deep(.custom-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15) !important;
}

/* Título principal */
.card-title {
  text-align: center;
  color: #000000;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

/* Secciones internas */
.card-section {
  padding: 1rem 1.25rem;
}

.section-title {
  color: #004d5a;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* Botón principal */
:deep(.accept-btn) {
  background-color: var(--color-first-complementary) !important;
  border: none !important;
  color: #fff !important;
  padding: 0.8rem 2rem !important;
  font-weight: 600 !important;
  border-radius: 25px !important;
  transition: background 0.25s ease !important;
}

:deep(.accept-btn:hover) {
  background-color: color-mix(in srgb, var(--color-first-complementary) 80%, #000 10%) !important;
}

/* Animación de entrada */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
