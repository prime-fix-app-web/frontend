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
  router.push("/layout-owner/payment-service/rating");
}
</script>

<template>
  <div class="flex justify-content-center p-5">
    <pv-card class="w-full md:w-6 lg:w-4 shadow-3 border-round-lg">
      <template #title>
        Servicio pagado
      </template>

      <template #content>
        <p class="mb-4">El pago fue concretado con éxito</p>
        <div class="flex justify-content-center">
          <pv-button label="Aceptar" severity="warning" rounded @click="goToRating" />
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.text-primary {
  color: #004d5a;
}
.border-primary {
  border-color: #004d5a;
}
</style>
