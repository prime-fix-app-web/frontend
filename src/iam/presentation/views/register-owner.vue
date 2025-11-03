<script setup>
import {useRouter} from "vue-router";
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import useIamStore from "@/iam/application/iam.store.js";

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();

const { startRegistrationFlow, saveRegisterOwner } = store;

/**
 * Password visibility toggle
 * @type {Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>} - true if password is visible, false otherwise
 */
const isPasswordVisible = ref(false);

/**
  * Track touched fields for validation
  */
const touchedFields = ref({
  fullName: false,
  username: false,
  dni: false,
  phone_number: false,
  department: false,
  district: false,
  address: false,
  email: false,
  password: false,
});

/**
 * Registration form data
 */
const registerForm = ref({
  fullName: '',
  username: '',
  dni: '',
  phone_number: '',
  department: '',
  district: '',
  address: '',
  email: '',
  password: '',
});

/**
 * Validate email format
 * @param email - Email string
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
  if (!email) return false;
  const trimmedEmail = email.trim();
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmedEmail);
};

/**
 * Validate DNI (Peruvian format: 8 digits)
 * @param dni - DNI string
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidDni = (dni) => {
  if (!dni) return false;
  const trimmedDni = dni.trim();
  return /^\d{8}$/.test(trimmedDni);
};

/**
 * Validate phone number (Peruvian format: 9 digits)
 * @param phone - Phone number string
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidPhone = (phone) => {
  if (!phone) return false;
  const trimmedPhone = phone.trim();
  return /^\d{9}$/.test(trimmedPhone);
};

/**
 * Mark a field as touched
 * @param fieldName - Name of the field
 */
const markAsTouched = (fieldName) => {
  touchedFields.value[fieldName] = true;
};

/**
 * Form error messages
 */
const formErrors = computed(() => {
  const trimmedEmail = registerForm.value.email.trim();
  const trimmedDni = registerForm.value.dni.trim();
  const trimmedPhone = registerForm.value.phone_number.trim();

  return {
    fullName: touchedFields.value.fullName && registerForm.value.fullName.trim().length < 2
      ? t('register-auto-repair-catalog.fullNameRequired') : null,
    username: touchedFields.value.username && registerForm.value.username.trim().length < 2
      ? t('register-auto-repair-catalog.usernameRequired') : null,
    dni: touchedFields.value.dni && !isValidDni(trimmedDni)
      ? t('register-auto-repair-catalog.dniPattern') : null,
    phone_number: touchedFields.value.phone_number && !isValidPhone(trimmedPhone)
      ? t('register-auto-repair-catalog.phonePattern') : null,
    department: touchedFields.value.department && registerForm.value.department.trim().length < 2
      ? t('register-auto-repair-catalog.departmentRequired') : null,
    district: touchedFields.value.district && registerForm.value.district.trim().length < 2
      ? t('register-auto-repair-catalog.districtRequired') : null,
    address: touchedFields.value.address && registerForm.value.address.trim().length < 5
      ? t('register-auto-repair-catalog.addressRequired') : null,
    email: touchedFields.value.email && !isValidEmail(trimmedEmail)
      ? t('register-auto-repair-catalog.emailInvalid') : null,
    password: touchedFields.value.password && registerForm.value.password.length < 6
      ? t('register-auto-repair-catalog.passwordRequired') : null,
  };
});

// Computed properties for validation
const isFormValid = computed(() => {
  const trimmedEmail = registerForm.value.email.trim();
  const trimmedDni = registerForm.value.dni.trim();
  const trimmedPhone = registerForm.value.phone_number.trim();

  return (
      registerForm.value.fullName.trim().length >= 2 &&
      registerForm.value.username.trim().length >= 2 &&
      isValidDni(trimmedDni) &&
      isValidPhone(trimmedPhone) &&
      registerForm.value.department.trim().length >= 2 &&
      registerForm.value.district.trim().length >= 2 &&
      registerForm.value.address.trim().length >= 5 &&
      isValidEmail(trimmedEmail) &&
      registerForm.value.password.length >= 6
  );
});

/**
 * Toggle password visibility
 */
function togglePasswordVisibility() {
  isPasswordVisible.value = !isPasswordVisible.value;
}

/**
 * Navigate to login page
 */
function navigateToLogin() {
  router.push('/iam/login');
}

/**
 * Navigate to plan auto-repair-catalog page
 */
function navigateToPlanOwner() {
  router.push('/iam/plan-auto-repair-catalog');
}

/**
 * Handle form submission
 */
function onSubmit() {
  // Mark all fields as touched to show all errors
  Object.keys(touchedFields.value).forEach(key => {
    touchedFields.value[key] = true;
  });

  if (!isFormValid.value) {
    console.log('❌ Form is invalid - Please check the errors below each field');
    return;
  }

  // Trim all fields before submitting
  const cleanedData = {
    fullName: registerForm.value.fullName.trim(),
    username: registerForm.value.username.trim(),
    dni: registerForm.value.dni.trim(),
    phone_number: registerForm.value.phone_number.trim(),
    department: registerForm.value.department.trim(),
    district: registerForm.value.district.trim(),
    address: registerForm.value.address.trim(),
    email: registerForm.value.email.trim(),
    password: registerForm.value.password,
  };

  console.log('✓ Register auto-repair-catalog data:', cleanedData);
  startRegistrationFlow('Vehicle Owner');
  saveRegisterOwner(cleanedData);
  navigateToPlanOwner();
}
</script>

<template>
  <section class="register-container">
    <div class="register-card">
      <div class="register-content">
        <div class="register-form-section">
          <h1 class="title">{{ $t('register-auto-repair-catalog.title') }}</h1>
          <p class="subtitle">
            {{ $t('register-auto-repair-catalog.haveAccount') }}
            <a class="link" @click="navigateToLogin">{{ $t('register-auto-repair-catalog.signIn') }}</a>
          </p>

          <form @submit.prevent="onSubmit" class="register-form" novalidate>
            <!-- Full Name -->
            <div class="form-group">
              <label for="fullName" class="label">{{ $t('register-auto-repair-catalog.fullName') }}</label>
              <input
                  id="fullName"
                  v-model="registerForm.fullName"
                  @blur="markAsTouched('fullName')"
                  type="text"
                  :placeholder="$t('register-auto-repair-catalog.fullNamePlaceholder')"
                  class="input"
                  :class="{ error: formErrors.fullName }"
              />
              <span v-if="formErrors.fullName" class="error-message">{{ formErrors.fullName }}</span>
            </div>

            <!-- Username -->
            <div class="form-group">
              <label for="username" class="label">{{ $t('register-auto-repair-catalog.username') }}</label>
              <input
                  id="username"
                  v-model="registerForm.username"
                  @blur="markAsTouched('username')"
                  type="text"
                  :placeholder="$t('register-auto-repair-catalog.usernamePlaceholder')"
                  class="input"
                  :class="{ error: formErrors.username }"
              />
              <span v-if="formErrors.username" class="error-message">{{ formErrors.username }}</span>
            </div>

            <!-- DNI and Phone Number -->
            <div class="form-row">
              <div class="form-group">
                <label for="dni" class="label">{{ $t('register-auto-repair-catalog.dni') }}</label>
                <input
                    id="dni"
                    v-model="registerForm.dni"
                    @blur="markAsTouched('dni')"
                    type="text"
                    maxlength="8"
                    :placeholder="$t('register-auto-repair-catalog.dniPlaceholder')"
                    class="input"
                    :class="{ error: formErrors.dni }"
                />
                <span v-if="formErrors.dni" class="error-message">{{ formErrors.dni }}</span>
              </div>

              <div class="form-group">
                <label for="phone_number" class="label">{{ $t('register-auto-repair-catalog.phone_number') }}</label>
                <input
                    id="phone_number"
                    v-model="registerForm.phone_number"
                    @blur="markAsTouched('phone_number')"
                    type="text"
                    maxlength="9"
                    :placeholder="$t('register-auto-repair-catalog.phone_numberPlaceholder')"
                    class="input"
                    :class="{ error: formErrors.phone_number }"
                />
                <span v-if="formErrors.phone_number" class="error-message">{{ formErrors.phone_number }}</span>
              </div>
            </div>

            <!-- Department and District -->
            <div class="form-row">
              <div class="form-group">
                <label for="department" class="label">{{ $t('register-auto-repair-catalog.department') }}</label>
                <input
                    id="department"
                    v-model="registerForm.department"
                    @blur="markAsTouched('department')"
                    type="text"
                    :placeholder="$t('register-auto-repair-catalog.departmentPlaceholder')"
                    class="input"
                    :class="{ error: formErrors.department }"
                />
                <span v-if="formErrors.department" class="error-message">{{ formErrors.department }}</span>
              </div>

              <div class="form-group">
                <label for="district" class="label">{{ $t('register-auto-repair-catalog.district') }}</label>
                <input
                    id="district"
                    v-model="registerForm.district"
                    @blur="markAsTouched('district')"
                    type="text"
                    :placeholder="$t('register-auto-repair-catalog.districtPlaceholder')"
                    class="input"
                    :class="{ error: formErrors.district }"
                />
                <span v-if="formErrors.district" class="error-message">{{ formErrors.district }}</span>
              </div>
            </div>

            <!-- Address -->
            <div class="form-group">
              <label for="address" class="label">{{ $t('register-auto-repair-catalog.address') }}</label>
              <input
                  id="address"
                  v-model="registerForm.address"
                  @blur="markAsTouched('address')"
                  type="text"
                  :placeholder="$t('register-auto-repair-catalog.addressPlaceholder')"
                  class="input"
                  :class="{ error: formErrors.address }"
              />
              <span v-if="formErrors.address" class="error-message">{{ formErrors.address }}</span>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="label">{{ $t('register-auto-repair-catalog.email') }}</label>
              <input
                  id="email"
                  v-model="registerForm.email"
                  @blur="markAsTouched('email')"
                  type="email"
                  :placeholder="$t('register-auto-repair-catalog.emailPlaceholder')"
                  class="input"
                  :class="{ error: formErrors.email }"
              />
              <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password" class="label">{{ $t('register-auto-repair-catalog.password') }}</label>
              <div class="password-container">
                <input
                    id="password"
                    v-model="registerForm.password"
                    @blur="markAsTouched('password')"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :placeholder="$t('register-auto-repair-catalog.passwordPlaceholder')"
                    class="input password-input"
                    :class="{ error: formErrors.password }"
                />
                <button
                    type="button"
                    class="password-toggle"
                    @click="togglePasswordVisibility"
                    :aria-label="$t('register-auto-repair-catalog.togglePassword')"
                >
                  <svg class="icon">
                    <use :href="isPasswordVisible ? '/assets/icons/sprite.symbol.svg#eye-off' : '/assets/icons/sprite.symbol.svg#eye'"></use>
                  </svg>
                </button>
              </div>
              <span v-if="formErrors.password" class="error-message">{{ formErrors.password }}</span>
            </div>

            <button type="submit" class="submit" :disabled="!isFormValid">
              {{ $t('register-auto-repair-catalog.register') }}
            </button>
          </form>
        </div>

        <div class="register-image-section">
          <img src="/assets/images/register-owner.webp" alt="Car Owner" class="register-image" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;

  font-family: var(--font-sans);
}

.register-card {
  width: 100%;
  max-width: 1100px;
  background: var(--color-light);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .15);
  overflow: hidden;
}

.register-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 600px;
}

.register-form-section {
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
}

.register-image-section {
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.register-image {
  width: 100%;
  max-width: 450px;
  height: auto;
  object-fit: contain;
  border-radius: 1rem;
}

.title {
  margin: 0 0 0.5rem 0;
  font-family: var(--font-bold);
  font-size: 1.75rem;
  color: var(--color-primary);
}

.subtitle {
  margin: 0 0 2rem 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.link {
  color: var(--color-first-complementary);
  font-family: var(--font-semibold);
  cursor: pointer;
  text-decoration: none;
  transition: opacity .2s ease;
}

.link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-row .form-group {
  margin: 0;
}

.label {
  font-family: var(--font-medium);
  font-size: 0.9rem;
  color: var(--color-dark);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  font-family: var(--font-regular);
  transition: all .2s ease;
  background: #fff;
  box-sizing: border-box;
  height: 48px;
  color: var(--color-dark);
}

.input:focus {
  outline: none;
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.1);
}

.input.error {
  border-color: #e74c3c;
}

.input::placeholder {
  color: #9ca3af;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper .input {
  padding-right: 3rem;
}

.password-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
}

.password-input {
  padding-right: 3rem !important;
  height: 100%;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
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

.password-toggle .icon {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity .2s ease;
}

.toggle-password:hover {
  opacity: 0.7;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  font-family: var(--font-medium);
  margin-top: 0.25rem;
  display: block;
}

.error {
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: -0.25rem;
}

.submit {
  width: 100%;
  padding: 0.875rem 1rem;
  margin-top: 0.5rem;
  border: none;
  border-radius: 8px;
  background: var(--color-first-complementary);
  color: var(--color-dark);
  font-family: var(--font-semibold);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 48px;
}

.submit:hover:not(:disabled) {
  background-color: #ffb700;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.submit:active:not(:disabled) {
  transform: translateY(0);
}

.submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .register-content {
    grid-template-columns: 1fr;
  }

  .register-image-section {
    display: none;
  }

  .register-card {
    max-width: 600px;
  }
}

@media (max-width: 640px) {
  .register-container {
    padding: 1rem;
  }

  .register-form-section {
    padding: 2rem 1.5rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .subtitle {
    font-size: 0.875rem;
  }

  .register-form {
    gap: 1rem;
  }
}

/* Focus and Accessibility */
.input:focus-visible,
.submit:focus-visible,
.toggle-password:focus-visible {
  outline: 2px solid var(--color-first-complementary);
  outline-offset: 2px;
}
</style>