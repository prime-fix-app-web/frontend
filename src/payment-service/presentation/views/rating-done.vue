<script setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";

const router = useRouter();

// Simulación: mostrar un mensaje al montar
onMounted(() => {
  console.log("Calificación realizada con éxito");
});

</script>

<template>
  <div class="rating-wrapper">
    <pv-card class="rating-card">
      <template #title>
        <h2 class="rating-card-title">Calificación realizada</h2>
      </template>

      <template #content>
        <p class="rating-card-text mb-4">La calificación fue concretada con éxito</p>
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

/* === Tarjeta === */
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

/* === Título === */
.rating-card-title {
  color: #000;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* === Texto === */
.rating-card-text {
  color: #333;
  font-size: 1.05rem;
}
</style>
