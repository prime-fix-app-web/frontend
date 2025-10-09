<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const invalid_path = router.currentRoute.value.fullPath;

const goToLogin = () => {
  router.push('/iam/login');
};
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">{{ t('page-not-found.title') }}</h2>
      <p class="error-message" v-html="t('page-not-found.content', {'invalid_path' : invalid_path } )"></p>
      <button @click="goToLogin" class="btn-go-home">
        {{ t('page-not-found.go-login') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--color-primary);
  padding: 2rem;
}

.not-found-content {
  background: var(--color-light);
  border-radius: 1rem;
  padding: 3rem 2rem;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.error-code {
  font-family: var(--font-extrabold);
  font-size: 8rem;
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
  text-shadow: 4px 4px 0px var(--color-first-complementary);
}

.error-title {
  font-family: var(--font-bold);
  font-size: 2rem;
  color: var(--color-primary);
  margin: 1rem 0;
}

.error-message {
  font-family: var(--font-regular);
  font-size: 1.125rem;
  color: var(--color-dark);
  margin: 1.5rem 0 2rem;
  line-height: 1.6;
}

.error-message strong {
  font-family: var(--font-semibold);
  color: var(--color-primary);
}

.btn-go-home {
  font-family: var(--font-semibold);
  background-color: var(--color-first-complementary);
  color: var(--color-light);
  border: none;
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.3);
}

.btn-go-home:hover {
  background-color: #d99419;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(242, 170, 31, 0.4);
}

.btn-go-home:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .error-code {
    font-size: 5rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .not-found-content {
    padding: 2rem 1.5rem;
  }
}
</style>