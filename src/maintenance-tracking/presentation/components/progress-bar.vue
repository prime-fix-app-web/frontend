<script setup lang="ts">
import { computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import usePaymentStore from "@/payment-service/application/payment-service.store.js";
import {useI18n} from "vue-i18n";

const props = defineProps<{
  currentStep: number;
  currentVehicle?: { id: string };
}>();


// Router de Vue
const router = useRouter();
const {t} = useI18n();

const paymentServiceStore = usePaymentStore()

const steps = [
  { id: 1, label: 'En espera', translationKey: 'progress-bar.waiting' },
  { id: 2, label: 'En diagnóstico', translationKey: 'progress-bar.diagnosis' },
  { id: 3, label: 'En reparación', translationKey: 'progress-bar.repair' },
  { id: 4, label: 'En prueba', translationKey: 'progress-bar.testing' },
  { id: 5, label: 'Listo para recoger', translationKey: 'progress-bar.readyPickup' },
  { id: 6, label: 'Recogido', translationKey: 'progress-bar.collected' }
];

const isStepCompleted = (stepId: number) => stepId < props.currentStep;
const isCurrentStep = (stepId: number) => stepId === props.currentStep;
const isStepPending = (stepId: number) => stepId > props.currentStep;

const goPayment = () => {
  paymentServiceStore.vehicleIdFilter = props.currentVehicle?.id;
  router.push('/layout-vehicle-owner/payment-service/payment');
};
</script>

<template>
  <div class="progress-container">
    <div class="progress-steps">
      <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="step-wrapper"
      >
        <div class="step-item">
          <div
              class="step-circle"
              :class="{
              completed: isStepCompleted(step.id),
              current: isCurrentStep(step.id),
              pending: isStepPending(step.id)
            }"
          >
            {{ step.id }}
          </div>

          <span
              class="step-label"
              :class="{
              completed: isStepCompleted(step.id),
              current: isCurrentStep(step.id),
              pending: isStepPending(step.id)
            }"
          >
            {{ t(step.translationKey) }}
          </span>
        </div>

        <div
            v-if="index !== steps.length - 1"
            class="progress-line"
            :class="{
            completed: isStepCompleted(step.id + 1) || isCurrentStep(step.id + 1)
          }"
        ></div>
      </div>
    </div>
    <div v-if="currentStep === 6" class="payment-section">
      <p class="payment-message">
        {{ t('progress-bar.message-collect') }}
      </p>

      <button
          type="button"
          class="payment-button"
          @click="goPayment"
      >
        {{ t('progress-bar.button-go-payment') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  padding: 2rem 0;
  width: 100%;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  width: 100%;
}

.step-wrapper {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-wrapper:last-child {
  flex: none;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-bold);
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

/* Estados del círculo */
.step-circle.completed {
  background: var(--color-first-complementary);
  color: var(--color-dark);
  border-color: var(--color-first-complementary);
}

.step-circle.current {
  background: var(--color-first-complementary);
  color: var(--color-dark);
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 4px rgba(242, 170, 31, 0.3);
}

.step-circle.pending {
  background: #9ca3af;
  color: var(--color-light);
  border-color: #9ca3af;
}

.step-label {
  font-family: var(--font-medium);
  font-size: 0.85rem;
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
  transition: all 0.3s ease;
}

/* Estados del label */
.step-label.completed {
  color: var(--color-primary);
  font-family: var(--font-semibold);
}

.step-label.current {
  color: var(--color-primary);
  font-family: var(--font-semibold);
}

.step-label.pending {
  color: #6b7280;
}

.progress-line {
  height: 4px;
  background: #e5e7eb;
  flex: 1;
  margin: 0 1rem;
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
  top: -20px; /* Align with circles */
}

.progress-line.completed {
  background: var(--color-first-complementary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .progress-container {
    padding: 1.5rem 0;
  }

  .step-circle {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }

  .step-label {
    font-size: 0.75rem;
    max-width: 70px;
  }

  .progress-line {
    margin: 0 0.5rem;
    height: 3px;
    top: -17px;
  }
}

@media (max-width: 480px) {
  .progress-container {
    padding: 1rem 0;
  }

  .step-circle {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }

  .step-label {
    font-size: 0.7rem;
    max-width: 60px;
  }

  .progress-line {
    margin: 0 0.25rem;
    height: 2px;
    top: -15px;
  }

  .step-item {
    gap: 0.5rem;
  }
}

/* Payment Section */
.payment-section {
  margin-top: 3rem;
  padding: 2rem;
  background: var(--color-second-complementary);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.payment-message {
  font-family: var(--font-semibold);
  font-size: 1.2rem;
  color: var(--color-primary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.payment-button {
  width: 100%;
  max-width: 400px;
  padding: 1.25rem 2rem;
  border: none;
  border-radius: 12px;
  background: var(--color-first-complementary);
  color: var(--color-dark);
  font-family: var(--font-bold);
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-height: 60px;
}

.payment-button:hover {
  background: #ffb700;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 193, 7, 0.4);
}

.payment-button:active {
  transform: translateY(0);
}

/* Responsive Design for Payment Section */
@media (max-width: 768px) {
  .payment-section {
    margin-top: 2rem;
    padding: 1.5rem;
    gap: 1.25rem;
  }

  .payment-message {
    font-size: 1.1rem;
  }

  .payment-button {
    font-size: 1.1rem;
    padding: 1.1rem 1.75rem;
    min-height: 55px;
  }
}

@media (max-width: 480px) {
  .payment-section {
    margin-top: 1.5rem;
    padding: 1.25rem;
    gap: 1rem;
  }

  .payment-message {
    font-size: 1rem;
  }

  .payment-button {
    font-size: 1rem;
    padding: 1rem 1.5rem;
    min-height: 50px;
  }
}



</style>