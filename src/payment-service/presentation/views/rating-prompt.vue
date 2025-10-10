<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

// Si el usuario decide no calificar
function skipRating() {
  router.push("/layout-owner/home-owner");
}

// Si el usuario decide calificar
function goToRatingForm() {
  router.push("/layout-owner/payment-service/rating/form");
}
</script>

<template>
  <div class="flex flex-column align-items-center justify-content-center h-screen bg-white">
    <!-- Subtítulo -->
    <p class="text-600 mb-4 text-lg">Calificar servicio</p>

    <!-- Tarjeta -->
    <pv-card class="w-full max-w-md shadow-3 border-round-lg surface-50 p-5 text-center">
      <template #title>
        Calificación del servicio
      </template>

      <template #content>
        <p class="text-md mb-5 text-700">
          Se ha culminado con la atención.<br />
          ¿Deseas calificar el servicio?
        </p>

        <div class="flex justify-content-center gap-3">
          <pv-button
              label="Ahora no"
              severity="warning"
              rounded
              class="w-8rem"
              @click="skipRating"
          />
          <pv-button
              label="Calificar"
              severity="warning"
              rounded
              class="w-8rem"
              @click="goToRatingForm"
          />
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
