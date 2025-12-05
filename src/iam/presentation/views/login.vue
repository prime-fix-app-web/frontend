<script setup lang="js">
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import useIamStore from "@/iam/application/iam.store.js";
import { storeToRefs } from 'pinia';
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import usePaymentStore from "@/payment-service/application/payment-service.store.js";

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const store = useIamStore();
const storeCatalog = useCatalogStore();
const storePayments = usePaymentStore();

const {userAccounts, userAccountsLoaded, userLoaded, errors} = storeToRefs(store);
const {fetchUserAccounts, fetchUsers, login} = store;

const {fetchLocations} = storeCatalog;
const {locationsLoaded} = storeToRefs(storeCatalog);

const {fetchPayments} = storePayments;
const {paymentsLoaded} = storeToRefs(storePayments);

/**
 * Login form data
 * @type {import("vue").Ref<UnwrapRef<{username: string, password: string}>>
 */
const form = ref({ username: '', password: '' });
/**
 * Password visibility state
 * @type {import("vue").Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>}
 */
const isPasswordVisible = ref(false);
/**
 * Indicates if the form is being submitted
 * @type {import("vue").Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>}
 */
const isSubmitting = ref(false);

/**
 * Indicates if the app is loading
 * @type {import("vue").Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>}
 */
const isAppLoading = ref(false);

/**
 * Form validation errors
 * @type {import("vue").Ref<UnwrapRef<{username: null|string, password: null|string}>, UnwrapRef<{username: null|string, password: null|string}> | {username: null|string, password: null|string}>}
 */
const errorsForm = ref({ username: null, password: null });

/**
 * Login error message
 * @type {import("vue").Ref<UnwrapRef<string>, UnwrapRef<string> | string>}
 */
const loginError = ref('');

/**
 * Watch form changes to validate inputs
 */
onMounted(() => {
  // Solo hacer fetch si hay JWT token o estamos en modo supabase-only
  const hasToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (!hasToken) {
    console.log('[Login] No JWT token found, skipping data fetch');
    // Marcar como loaded para evitar el estado de "Cargando..."
    return;
  }

  if(!userAccountsLoaded.value) fetchUserAccounts();
  if(!userLoaded.value) fetchUsers();
  if(!locationsLoaded.value) fetchLocations();
  if(!paymentsLoaded.value) fetchPayments();

  console.log('userAccountsLoaded:', userAccountsLoaded.value);
  console.log('userLoaded:', userLoaded.value);
  console.log('isDataReady:', isDataReady.value);
});

/**
 * Computed property to check if user data is loaded
 * Si no hay token JWT, consideramos que está listo (no necesitamos datos pre-cargados)
 * @type {ComputedRef<unknown>}
 */
const isDataReady = computed(() => {
  const hasToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  // Si no hay token, está listo (el login cargará los datos después)
  if (!hasToken) {
    return true;
  }

  // Si hay token, esperar a que los datos estén cargados
  return userAccountsLoaded.value && userLoaded.value;
});

/**
 * Validate username
 * @param username - The username string to validate
 * @returns {{invalid: boolean}|null|{required: boolean}}
 */
function validateUsername(username) {
  if (!username) {
    return { required: true };
  }
  if (username.length < 3) {
    return { minLength: true };
  }
  return null;
}

/**
 * Validate password
 * @param password - string
 * @returns {{minLength: boolean}|null|{required: boolean}} - validation error or null if valid
 */
function validatePassword(password) {
  if (!password) {
    return { required: true };
  }
  if (password.length < 6) {
    return { minLength: true };
  }
  return null;
}

/**
 * Computed property to check if the form is valid
 * @type {ComputedRef<unknown>} - true if the form is valid, false otherwise
 */
const isFormValid = computed(() => {
  return isDataReady.value &&
         form.value.username &&
         form.value.password &&
         form.value.username.length >= 3 &&
         form.value.password.length >= 6;
});

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

/**
 * Handle form submission
 */
async function onSubmit() {
  isSubmitting.value = true;
  loginError.value = '';

  try {
    const account = await login(form.value.username.trim(), form.value.password.trim());

    console.log("✅ Login exitoso:", account);

    if (account.role_id === 1) {
      await router.push("/layout-vehicle-owner/dashboard-owner");
    } else if (account.role_id === 2) {
      await router.push("/layout-workshop/dashboard-workshop");
    } else {
      console.warn("Rol desconocido, redirigiendo a login");
      await router.push("/iam/login");
    }
  } catch (err) {
    console.error("❌ Login fallido:", err);
    loginError.value = "Credenciales incorrectas";
  } finally {
    isSubmitting.value = false;
  }
}

/**
 * Navigate to user role selection for registration
 */
function navigateToUserRole() {
  router.push('/iam/user-role');
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-container">
        <img src="/logo.svg" alt="Prime-Fix Logo" class="logo" />
        <span>PRIME-FIX</span>
      </div>

      <!-- Registration Link -->
      <div class="register-link">
        <span>{{ $t('login.noAccount') }}</span>
        <button type="button" class="link-button" @click="navigateToUserRole()">
          {{ t('login.signUp') }}
        </button>
      </div>
      <!-- Login Form -->
      <form @submit.prevent="onSubmit" class="login-form">
        <!-- Username Field -->
        <div class="form-group">
          <input
              type="text"
              v-model="form.username"
              autocomplete="username"
              :placeholder="$t('login.username')"
              class="form-input"
              :class="{ error: errorsForm.username }"
          />
          <div v-if="errorsForm.username" class="error-message">
            <span v-if="errorsForm.username.required">{{ $t('login.usernameRequired') }}</span>
            <span v-if="errorsForm.username.minLength && !loginError">{{ $t('login.usernameMinLength') }}</span>
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <div class="password-container">
            <input
                :type="isPasswordVisible ? 'text' : 'password'"
                v-model="form.password"
                autocomplete="current-password"
                placeholder="••••••••••"
                class="form-input password-input"
                :class="{ error: errorsForm.password }"
            />
            <button
                type="button"
                class="password-toggle"
                @click="togglePasswordVisibility"
                :aria-label="isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            >
              <svg class="icon">
                <use :href="isPasswordVisible ? '/assets/icons/sprite.symbol.svg#eye-off' : '/assets/icons/sprite.symbol.svg#eye'"></use>
              </svg>
            </button>
          </div>
          <div v-if="errorsForm.password" class="error-message">
            <span v-if="errorsForm.password.required">{{ $t('login.passwordRequired') }}</span>
            <span v-if="errorsForm.password.minLength && !loginError">{{ $t('login.passwordMinLength') }}</span>
          </div>
        </div>

        <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting || !isFormValid"
            :class="{ loading: isSubmitting }"
        >
          <div v-if="isSubmitting || !isDataReady" class="spinner"></div>
          <div>
            {{ !isDataReady ? 'Cargando…' : (isSubmitting ? $t('login.loading') : $t('login.signIn')) }}
          </div>
        </button>

        <!-- Error message for invalid credentials -->
        <p v-if="loginError" class="error-message-box">
          {{ loginError }}
        </p>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  font-family: var(--font-sans);
}

.login-card {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Logo Styles */
.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  gap: 0.5rem;
  background-color: #e7e4dd;
  padding: 2rem;
  border-radius: 12px;
}

.logo {
  width: 160px;
  height: auto;
  /* Remove the filter to show the original logo colors */
}

.logo-container span {
  color: var(--color-light);
  font-family: var(--font-bold);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
}

/* Registration Link */
.register-link {
  color: var(--color-light);
  font-size: 0.9rem;
  text-align: center;
}

.link-button {
  background: none;
  border: none;
  color: var(--color-first-complementary);
  font-family: inherit;
  font-size: inherit;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 0.5rem;
  padding: 0;
  transition: color 0.2s ease;
}

.link-button:hover {
  color: #ffb700;
}

/* Form Styles */
.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--color-light);
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--color-dark);
  box-sizing: border-box;
  transition: box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-first-complementary);
}

.form-input.error {
  box-shadow: 0 0 0 2px #e74c3c;
}

.form-input::placeholder {
  color: #666;
}

/* Password Container */
.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  padding-right: 3rem;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 24px;
  height: 24px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--color-primary);
}


/* Error Messages */
.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  text-align: left;
}

.error-message-box {
  background-color: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  border-radius: 8px;
  color: #e74c3c;
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
  text-align: center;
  margin: 0;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  font-family: var(--font-semibold);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 52px;
}

.submit-button:hover:not(:disabled) {
  background-color: #ffb700;
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.submit-button.loading {
  pointer-events: none;
}

/* Loading Spinner */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid var(--color-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    max-width: 100%;
  }

  .form-input {
    padding: 0.875rem;
    font-size: 0.9rem;
  }

  .submit-button {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
}

/* Focus and Accessibility */
.form-input:focus,
.submit-button:focus,
.link-button:focus,
.password-toggle:focus {
  outline: 2px solid var(--color-first-complementary);
  outline-offset: 2px;
}


</style>