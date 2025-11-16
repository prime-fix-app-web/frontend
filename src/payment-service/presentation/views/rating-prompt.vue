<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// Si el usuario decide no calificar
function skipRating() {
  router.push("/layout-vehicle-owner/home-owner");
}

// Si el usuario decide calificar
function goToRatingForm() {
  router.push("/layout-vehicle-owner/payment-service/rating/form");
}
</script>

<template>
  <div class="rating-wrapper">
    <!-- Subtítulo -->
    <p class="text-600 mb-4 text-lg">Calificar servicio</p>

    <!-- Tarjeta -->
    <pv-card class="rating-card">
      <template #title>
        <h2 class="card-title">Calificación del servicio</h2>
      </template>

      <template #content>
        <p class="card-text">
          Se ha culminado con la atención.<br />
          ¿Deseas calificar el servicio?
        </p>

        <div class="button-group">
          <pv-button
              label="Ahora no"
              severity="warning"
              rounded
              class="action-btn"
              @click="skipRating"
          />
          <pv-button
              label="Calificar"
              severity="warning"
              rounded
              class="action-btn"
              @click="goToRatingForm"
          />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.rating-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f6f7f9;
}

:deep(.rating-card) {
  background-color: var(--color-second-complementary) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  padding: 2rem 2.5rem !important;
  border: 1px solid #e0e0e0 !important;
  max-width: 420px !important;
  text-align: center;
  transition: all 0.3s ease;
}

:deep(.rating-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15) !important;
}

/* Texto general */
.card-title {
  color: #000000;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.card-text {
  color: #000000;
  font-size: 1.05rem;
  margin-bottom: 2rem;
}

/* Botones */
.button-group {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

:deep(.action-btn) {
  background-color: var(--color-first-complementary) !important;
  border: none !important;
  color: #ffffff !important;
  padding: 0.8rem 2rem !important;
  font-weight: 600 !important;
  border-radius: 25px !important;
  transition: background 0.25s ease !important;
}

:deep(.action-btn:hover) {
  background-color: var(--color-first-complementary) !important;
}
</style>
