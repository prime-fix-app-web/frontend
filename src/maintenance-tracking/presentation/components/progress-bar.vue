<script setup>
import { ref } from 'vue';

const props = defineProps({
  currentStep: {
    type: Number,
    default: 1
  }
});

const steps = ref([
  { id: 1, label: 'Waiting', translationKey: 'progress-bar.waiting' },
  { id: 2, label: 'In diagnosis', translationKey: 'progress-bar.diagnosis' },
  { id: 3, label: 'In repair', translationKey: 'progress-bar.repair' },
  { id: 4, label: 'Testing', translationKey: 'progress-bar.testing' },
  { id: 5, label: 'Ready for pickup', translationKey: 'progress-bar.readyPickup' },
  { id: 6, label: 'Collected', translationKey: 'progress-bar.collected' }
]);

function isStepCompleted(stepId) {
  return stepId < props.currentStep;
}

function isCurrentStep(stepId) {
  return stepId === props.currentStep;
}

function isStepPending(stepId) {
  return stepId > props.currentStep;
}
</script>

<template>
  <div class="progress-container">
    <div class="progress-steps">
      <div
          v-for="(step, idx) in steps"
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
            {{ $t(step.translationKey) }}
          </span>
        </div>
        <div
            v-if="idx !== steps.length - 1"
            class="progress-line"
            :class="{
              completed: isStepCompleted(step.id + 1) || isCurrentStep(step.id + 1)
            }"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.progress-container {
  padding: 2rem 0;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.progress-steps {
  display: flex;
  align-items: flex-start;
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
  flex: 0 0 auto;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
  width: 100%;
}

.step-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-bold);
  font-size: 1.2rem;
  font-weight: 700;
  transition: all 0.3s ease;
  border: 3px solid;
  flex-shrink: 0;
}

.step-circle.completed,
.step-circle.current {
  background: #F2AA1F;
  color: #000;
  border-color: #F2AA1F;
}

.step-circle.pending {
  background: #9CA3AF;
  color: #FFF;
  border-color: #9CA3AF;
}

.step-label {
  font-family: var(--font-medium);
  font-size: 0.9rem;
  text-align: center;
  max-width: 90px;
  line-height: 1.3;
  transition: all 0.3s ease;
  word-wrap: break-word;
}

.step-label.completed,
.step-label.current {
  color: #000;
  font-family: var(--font-semibold);
}

.step-label.pending {
  color: #6B7280;
}

.progress-line {
  height: 4px;
  background: #E5E7EB;
  flex: 1;
  margin: 0 10px;
  border-radius: 2px;
  transition: all 0.3s ease;
  position: relative;
  top: -25px;
  min-width: 40px;
}

.progress-line.completed {
  background: #F2AA1F;
}

/* Responsive Design */
@media (max-width: 768px) {
  .progress-container {
    padding: 1rem 0;
  }

  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 0.85rem;
  }

  .step-label {
    font-size: 0.7rem;
    max-width: 50px;
    line-height: 1.1;
  }

  .progress-line {
    margin: 0 4px;
    height: 3px;
    top: -16px;
    min-width: 15px;
  }
}

@media (max-width: 480px) {
  .progress-container {
    padding: 0.75rem 0;
    overflow-x: auto;
    max-width: 100%;
  }

  .progress-steps {
    min-width: 480px;
    padding: 0 10px;
  }

  .step-circle {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
    border-width: 2px;
  }

  .step-label {
    font-size: 0.65rem;
    max-width: 45px;
    line-height: 1;
  }

  .progress-line {
    margin: 0 3px;
    height: 2px;
    top: -14px;
    min-width: 12px;
  }

  .step-item {
    gap: 0.3rem;
  }
}

@media (max-width: 360px) {
  .progress-container {
    padding: 0.5rem 0;
  }

  .progress-steps {
    min-width: 400px;
    padding: 0 5px;
  }

  .step-circle {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }

  .step-label {
    font-size: 0.6rem;
    max-width: 40px;
  }

  .progress-line {
    margin: 0 2px;
    height: 2px;
    top: -12px;
    min-width: 10px;
  }
}

</style>