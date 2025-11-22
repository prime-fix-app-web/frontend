<script setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();

// Simulación: mostrar un mensaje al montar
onMounted(() => {
  console.log("Pago realizado con éxito");
});

// Función para continuar al rating
function goToRating() {
  router.push("/layout-vehicle-owner/payment-service/rating");
}
</script>

<template>
  <div class="card-wrapper">
    <pv-card class="custom-card">
      <template #title>
        <h2 class="card-title">Servicio pagado</h2>
      </template>
      <template #content>
        <p class="card-text mb-4">El pago fue concretado con éxito</p>
        <div class="flex justify-content-center">
          <pv-button
              label="Aceptar"
              severity="warning"
              rounded
              class="accept-btn"
              @click="goToRating"
          />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
/* Fondo general */
.bg-light {
  background-color: #ffffff;
}

.card-wrapper {
  display: flex;
  justify-content: center; /* centra horizontalmente */
  align-items: center; /* centra verticalmente */
  height: 100vh; /* altura completa del viewport */
  background-color: #f6f7f9;
}

/* Personalización profunda del pv-card */
:deep(.custom-card) {
  background-color: var(--color-second-complementary) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  padding: 2rem 2.5rem !important;
  border: 1px solid #e0e0e0 !important;
  max-width: 420px !important;
  transition: all 0.3s ease;
}

:deep(.custom-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15) !important;
}

/* Estilos del título */
.card-title {
  text-align: center;
  color: #000000;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* Texto del mensaje */
.card-text {
  text-align: center;
  color: #333;
  font-size: 1.05rem;
}

/* Botón personalizado */
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
  background-color: var(--color-first-complementary) !important;
}
</style>