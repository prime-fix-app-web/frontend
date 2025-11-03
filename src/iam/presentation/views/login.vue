<script setup lang="js">
import {useI18n} from "vue-i18n";
import {computed, onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import useIamStore from "@/iam/application/iam.store.js";
import { storeToRefs } from 'pinia';

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();
const {userAccounts, userAccountsLoaded, usersLoaded, locationsLoaded, paymentsLoaded,
  errors, fetchLocations, fetchPayments, fetchUserAccounts,
  fetchUsers, login} = store;

/**
 * Login form data
 * @type {Ref<UnwrapRef<{email: string, password: string}>, UnwrapRef<{email: string, password: string}> | {email: string, password: string}>} - form data with email and password
 */
const form = ref({ email: '', password: '' });
/**
 * Password visibility toggle
 * @type {Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>} - whether the password is visible or not
 */
const isPasswordVisible = ref(false);
/**
 * Form submission state
 * @type {Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>} - whether the form is being submitted or not
 */
const isSubmitting = ref(false);

/**
 * Form errors
 * @type {Ref<UnwrapRef<{email: null, password: null}>, UnwrapRef<{email: null, password: null}> | {email: null, password: null}>} - form errors for email and password
 */
const errorsForm = ref({ email: null, password: null });

/**
 * Login error message
 * @type {Ref<UnwrapRef<string>, UnwrapRef<string> | string>} - error message to display when login fails
 */
const loginError = ref('');

/**
 * On component mount, fetch user accounts and users if not already loaded
 */
onMounted(() => {
  if(!userAccountsLoaded) fetchUserAccounts();
  if(!usersLoaded) fetchUsers();
  if(!locationsLoaded) fetchLocations();
  if(!paymentsLoaded) fetchPayments();
});

// Indica si los datos necesarios para validar el login ya están listos
const isDataReady = computed(() => userAccountsLoaded.value && usersLoaded.value);

/**
 * Validate email format
 * @param email - the email string to validate
 * @returns {{invalid: boolean}|null|{required: boolean}} - validation error or null if valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { required: true };
  }
  if (!emailRegex.test(email)) {
    return { invalid: true };
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
         form.value.email &&
         form.value.password &&
         form.value.password.length >= 6 &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email);
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
function onSubmit() {
  if (!isDataReady.value) return; // Evita intentar loguear sin datos cargados

  // Reset errors
  errorsForm.value = { email: null, password: null };
  loginError.value = '';

  // Validate form
  const emailError = validateEmail(form.value.email);
  const passwordError = validatePassword(form.value.password);

  if (emailError || passwordError) {
    errorsForm.value.email = emailError;
    errorsForm.value.password = passwordError;
    return;
  }

  isSubmitting.value = true;
  login(form.value.email.trim(), form.value.password)
    .then((userAccount) => {
      console.log('Login successful', userAccount);

      // Redirect based on role (id_role: R001 = auto-repair-catalog, R002 = workshop)
      isSubmitting.value = false;
      if (userAccount.id_role === 'R001') {
        router.push('/layout-owner/home-owner');
      } else if (userAccount.id_role === 'R002') {
        router.push('/layout-workshop/home-workshop');
      } else {
        router.push('/iam/user-role');
      }
    })
    .catch((error) => {
      // Login failed
      console.error('Login failed', error);
      isSubmitting.value = false;
      errorsForm.value.email = { invalid: true };
      errorsForm.value.password = { invalid: true };
      loginError.value = t('login.invalidCredentials');
    });
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
              type="email"
              v-model="form.email"
              autocomplete="username"
              :placeholder="$t('login.email')"
              class="form-input"
              :class="{ error: errorsForm.email }"
          />
          <div v-if="errorsForm.email" class="error-message">
            <span v-if="errorsForm.email.required">{{ $t('login.emailRequired') }}</span>
            <span v-if="errorsForm.email.invalid && !loginError">{{ $t('login.emailInvalid') }}</span>
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