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
    router.push("/layout-vehicle-owner/payment-service/rating/done");
  } catch (err) {
    console.error("Error al enviar rating:", err);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div class="rating-form-wrapper">
    <p class="text-600 mb-4 text-lg">Calificar servicio</p>

    <pv-card class="rating-form-card">
      <template #title>
        <h2 class="card-title">Calificación del servicio</h2>
      </template>

      <template #content>
        <p class="card-text">
          ¿Cómo se siente con el servicio brindado?<br />
          (5 es completamente satisfecho y 1 es completamente insatisfecho)
        </p>

        <!-- Botones de calificación -->
        <div class="rating-buttons">
          <pv-button
              v-for="n in 5"
              :key="n"
              :label="n.toString()"
              rounded
              class="rating-btn"
              :severity="selectedRating === n ? 'warning' : 'secondary'"
              :class="{ 'active-rating': n <= selectedRating }"
              @click="selectedRating = n"
          />
        </div>

        <!-- Campo de comentario -->
        <div class="comment-section">
          <label class="block text-700 mb-2">Dejar un comentario (opcional)</label>
          <pv-input-text
              v-model="comment"
              class="comment-input"
              placeholder="Escribe tu comentario..."
          />
        </div>

        <!-- Botón enviar -->
        <pv-button
            label="Calificar"
            class="submit-btn"
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
.rating-form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f6f7f9;
}

/* Tarjeta principal */
:deep(.rating-form-card) {
  background-color: var(--color-second-complementary) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
  padding: 2rem 2.5rem !important;
  border: 1px solid #e0e0e0 !important;
  max-width: 420px !important;
  text-align: center;
  transition: all 0.3s ease;
}

:deep(.rating-form-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15) !important;
}

/* Texto */
.card-title {
  color: #000;
  font-weight: 700;
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.card-text {
  color: #000;
  font-size: 1.05rem;
  margin-bottom: 2rem;
}

/* Botones de calificación */
.rating-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

:deep(.rating-btn) {
  background-color: #d1d5db !important;
  border: none !important;
  color: #000 !important;
  font-weight: 600 !important;
  border-radius: 50% !important;
  width: 3rem !important;
  height: 3rem !important;
  transition: all 0.25s ease !important;
}

.active-rating {
  background-color: var(--color-first-complementary) !important;
  color: #fff !important;
}

/* Comentario */
.comment-section {
  text-align: left;
  margin-bottom: 1.5rem;
  color: #000;
}

.comment-label {
  color: #000;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.comment-input {
  width: 100%;
}

/* Botón enviar */
:deep(.submit-btn) {
  background-color: var(--color-first-complementary) !important;
  border: none !important;
  color: #fff !important;
  padding: 0.8rem 2rem !important;
  font-weight: 600 !important;
  border-radius: 25px !important;
  transition: background 0.25s ease !important;
}

:deep(.submit-btn:hover) {
  background-color: var(--color-first-complementary) !important;
}
</style>
