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
  <div class="flex justify-content-center p-5">
    <pv-card class="w-full md:w-6 lg:w-4 shadow-3 border-round-lg">
      <template #title>
        Calificación realizada
      </template>

      <template #content>
        <p class="mb-4">La calificación fue concretada con éxito</p>
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
