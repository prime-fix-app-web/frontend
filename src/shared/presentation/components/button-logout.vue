<script setup>
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useIamStore from "@/iam/application/iam.store.js";

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();

const { logout } = store;

const onLogout = () => {
  console.log("Logout");
  store.logout();
  router.push('/iam/login');
};
</script>

<template>
  <button class="logout-button" @click="onLogout">
    {{ t('button-logout.logout') }}
  </button>
</template>

<style scoped>
.logout-button {
  width: 100%;
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-family: var(--font-medium);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.logout-button:hover {
  background-color: #e6991a;
}

/* Responsive Design */
@media (max-width: 768px) {
  .logout-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    border-radius: 20px;
    min-width: fit-content;
    width: auto;
  }
}

@media (max-width: 480px) {
  .logout-button {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
    border-radius: 15px;
  }
}

@media (max-width: 320px) {
  .logout-button {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
    border-radius: 12px;
  }
}

</style>