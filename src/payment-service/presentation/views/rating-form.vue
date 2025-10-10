<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useIamStore from "@/iam/application/iam.store.js";
import usePaymentServiceStore from "@/payment-service/application/payment-service.store.js";

const router = useRouter();
const iamStore = useIamStore();
const paymentStore = usePaymentServiceStore();

// Obtenemos el id_user_account del usuario logeado
const idUserAccount = iamStore.sessionUserAccount?.id ?? null;

// Obtenemos la visita actual (V001 en este caso)
const currentVisit = "V001";
const idAutoRepair = currentVisit?.id_auto_repair ?? null;

// Estado local
const selectedRating = ref(null);
const comment = ref("");
const isSubmitting = ref(false);

// Enviar rating
async function submitRating() {
  if (!selectedRating.value) {
    alert("Por favor selecciona una calificación antes de enviar.");
    return;
  }

  isSubmitting.value = true;

  const newRating = {
    id_rating: "RT" + Math.floor(Math.random() * 1000), // ID simulado
    star_rating: selectedRating.value,
    comment: comment.value || "Sin comentarios",
    id_auto_repair: idAutoRepair,
    id_user_account: idUserAccount
  };

  try {
    await paymentStore.addRating(newRating);
    console.log("Rating enviado:", newRating);
    router.push("/layout-owner/payment-service/rating/done");
  } catch (err) {
    console.error("Error al enviar rating:", err);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="flex flex-column align-items-center justify-content-center h-screen bg-white">
    <p class="text-600 mb-4 text-lg">Calificar servicio</p>

    <pv-card class="w-full max-w-md shadow-3 border-round-lg surface-50 p-5 text-center">
      <template #title>
        Calificación del servicio
      </template>

      <template #content>
        <p class="text-md mb-4 text-700">
          ¿Cómo se siente con el servicio brindado?<br />
          (5 es completamente satisfecho y 1 es completamente insatisfecho)
        </p>

        <!-- Botones de calificación -->
        <div class="flex justify-content-center gap-3 mb-4">
          <pv-button
              v-for="n in 5"
              :key="n"
              :label="n.toString()"
              rounded
              :severity="selectedRating === n ? 'warning' : 'secondary'"
              @click="selectedRating = n"
          />
        </div>

        <!-- Campo de comentario -->
        <div class="text-left mb-3">
          <label class="block text-700 mb-2">Dejar un comentario (opcional)</label>
          <pv-input-text
              v-model="comment"
              class="w-full"
              placeholder="Escribe tu comentario..."
          />
        </div>

        <!-- Botón enviar -->
        <pv-button
            label="Calificar"
            class="w-8rem justify-center mt-3"
            severity="warning"
            rounded
            :loading="isSubmitting"
            @click="submitRating"
        />
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
