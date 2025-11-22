<script setup>

import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import useIamStore from "@/iam/application/iam.store.js";
import {computed, ref} from "vue";

const {t} = useI18n();
const router = useRouter();
const store = useIamStore();

const {startRegistrationFlow, saveRegisterWorkshop} = store;

/**
 * Password visibility toggle
 * @type {import('vue').Ref<UnwrapRef<boolean>, UnwrapRef<boolean> | boolean>} - true if password is visible, false otherwise
 */
const isPasswordVisible = ref(false);

/**
 * Track touched fields for validation
 */
const touchedFields = ref({
  workshopName: false,
  username: false,
  ruc: false,
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
  workshopName: '',
  username: '',
  ruc: '',
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
 * Validate RUC (11 digits)
 * @param ruc - DNI string
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidRuc = (ruc) => {
  if (!ruc) return false;
  const trimmedRuc = ruc.trim();
  return /^\d{11}$/.test(trimmedRuc);
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
  const trimmedRuc = registerForm.value.ruc.trim();
  const trimmedPhone = registerForm.value.phone_number.trim();

  return {
    workshopName: touchedFields.value.workshopName && registerForm.value.workshopName.trim().length < 2
      ? t('register-workshop.workshopNameRequired') : null,
    username: touchedFields.value.username && registerForm.value.username.trim().length < 2
      ? t('register-workshop.usernameRequired') : null,
    ruc: touchedFields.value.ruc && !isValidRuc(trimmedRuc)
      ? t('register-workshop.rucPattern') : null,
    phone_number: touchedFields.value.phone_number && !isValidPhone(trimmedPhone)
      ? t('register-workshop.phonePattern') : null,
    department: touchedFields.value.department && registerForm.value.department.trim().length < 2
      ? t('register-workshop.departmentRequired') : null,
    district: touchedFields.value.district && registerForm.value.district.trim().length < 2
      ? t('register-workshop.districtRequired') : null,
    address: touchedFields.value.address && registerForm.value.address.trim().length < 5
      ? t('register-workshop.addressRequired') : null,
    email: touchedFields.value.email && !isValidEmail(trimmedEmail)
      ? t('register-workshop.emailInvalid') : null,
    password: touchedFields.value.password && registerForm.value.password.length < 6
      ? t('register-workshop.passwordRequired') : null,
  };
});

/**
 * Check if the form is valid
 * @return {import('vue').ComputedRef<boolean>} - True if valid, false otherwise
 */
const isFormValid = computed(() => {
  const trimmedEmail = registerForm.value.email.trim();
  const trimmedRuc = registerForm.value.ruc.trim();
  const trimmedPhone = registerForm.value.phone_number.trim();

  return (
      registerForm.value.workshopName.trim().length >= 2 &&
      registerForm.value.username.trim().length >= 2 &&
      isValidRuc(trimmedRuc) &&
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
 * Navigate to plan workshop page
 */
function navigateToPlanWorkshop() {
  router.push('/iam/plan-workshop');
}

/**
 * Handle form submission
 */
function onSubmit() {
  // Mark all fields as touched to show validation errors
  Object.keys(touchedFields.value).forEach(field => {
    touchedFields.value[field] = true;
  });

  if (!isFormValid.value) {
    console.log('❌ Form is invalid - Please check the errors below each field');
    return;
  }

  const cleanedData = {
    workshopName: registerForm.value.workshopName.trim(),
    username: registerForm.value.username.trim(),
    ruc: registerForm.value.ruc.trim(),
    phone_number: registerForm.value.phone_number.trim(),
    department: registerForm.value.department.trim(),
    district: registerForm.value.district.trim(),
    address: registerForm.value.address.trim(),
    email: registerForm.value.email.trim(),
    password: registerForm.value.password,
  }

  console.log('✓ Register workshop data:', cleanedData);
  startRegistrationFlow('Auto Repair Workshop');
  saveRegisterWorkshop(cleanedData);
  navigateToPlanWorkshop();
}

</script>

<template>
  <section class="register-container">
    <div class="register-card">
      <div class="register-content">
        <div class="register-form-section">
          <h1 class="title">{{ $t('register-workshop.title') }}</h1>
          <p class="subtitle">
            {{ $t('register-workshop.haveAccount') }}
            <a class="link" @click="navigateToLogin">{{ $t('register-workshop.signIn') }}</a>
          </p>

          <form @submit.prevent="onSubmit" class="register-form" novalidate>
            <!-- Full Name -->
            <div class="form-group">
              <label for="workshopName" class="label">{{ $t('register-workshop.workshopName') }}</label>
              <input
                  id="workshopName"
                  v-model="registerForm.workshopName"
                  @blur="markAsTouched('workshopName')"
                  type="text"
                  :placeholder="$t('register-workshop.workshopNamePlaceholder')"
                  class="input"
                  :class="{ error: formErrors.workshopName }"
              />
              <span v-if="formErrors.workshopName" class="error-message">{{ formErrors.workshopName }}</span>
            </div>

            <!-- Username -->
            <div class="form-group">
              <label for="username" class="label">{{ $t('register-workshop.username') }}</label>
              <input
                  id="username"
                  v-model="registerForm.username"
                  @blur="markAsTouched('username')"
                  type="text"
                  :placeholder="$t('register-workshop.usernamePlaceholder')"
                  class="input"
                  :class="{ error: formErrors.username }"
              />
              <span v-if="formErrors.username" class="error-message">{{ formErrors.username }}</span>
            </div>

            <!-- RUC and Phone Number -->
            <div class="form-row">
              <div class="form-group">
                <label for="ruc" class="label">{{ $t('register-workshop.ruc') }}</label>
                <input
                    id="ruc"
                    v-model="registerForm.ruc"
                    @blur="markAsTouched('ruc')"
                    type="text"
                    maxlength="11"
                    :placeholder="$t('register-workshop.rucPlaceholder')"
                    class="input"
                    :class="{ error: formErrors.ruc }"
                />
                <span v-if="formErrors.ruc" class="error-message">{{ formErrors.ruc }}</span>
              </div>

              <div class="form-group">
                <label for="phone" class="label">{{ $t('register-workshop.phone') }}</label>
                <input
                    id="phone"
                    v-model="registerForm.phone_number"
                    @blur="markAsTouched('phone_number')"
                    type="text"
                    maxlength="9"
                    :placeholder="$t('register-workshop.phonePlaceholder')"
                    class="input"
                    :class="{ error: formErrors.phone_number }"
                />
                <span v-if="formErrors.phone_number" class="error-message">{{ formErrors.phone_number }}</span>
              </div>
            </div>

            <!-- Department and District -->
            <div class="form-row">
              <div class="form-group">
                <label for="department" class="label">{{ $t('register-workshop.department') }}</label>
                <input
                    id="department"
                    v-model="registerForm.department"
                    @blur="markAsTouched('department')"
                    type="text"
                    :placeholder="$t('register-workshop.departmentPlaceholder')"
                    class="input"
                    :class="{ error: formErrors.department }"
                />
                <span v-if="formErrors.department" class="error-message">{{ formErrors.department }}</span>
              </div>

              <div class="form-group">
                <label for="district" class="label">{{ $t('register-workshop.district') }}</label>
                <input
                    id="district"
                    v-model="registerForm.district"
                    @blur="markAsTouched('district')"
                    type="text"
                    :placeholder="$t('register-workshop.districtPlaceholder')"
                    class="input"
                    :class="{ error: formErrors.district }"
                />
                <span v-if="formErrors.district" class="error-message">{{ formErrors.district }}</span>
              </div>
            </div>

            <!-- Address -->
            <div class="form-group">
              <label for="address" class="label">{{ $t('register-workshop.address') }}</label>
              <input
                  id="address"
                  v-model="registerForm.address"
                  @blur="markAsTouched('address')"
                  type="text"
                  :placeholder="$t('register-workshop.addressPlaceholder')"
                  class="input"
                  :class="{ error: formErrors.address }"
              />
              <span v-if="formErrors.address" class="error-message">{{ formErrors.address }}</span>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="label">{{ $t('register-workshop.email') }}</label>
              <input
                  id="email"
                  v-model="registerForm.email"
                  @blur="markAsTouched('email')"
                  type="email"
                  :placeholder="$t('register-workshop.emailPlaceholder')"
                  class="input"
                  :class="{ error: formErrors.email }"
              />
              <span v-if="formErrors.email" class="error-message">{{ formErrors.email }}</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password" class="label">{{ $t('register-workshop.password') }}</label>
              <div class="password-container">
                <input
                    id="password"
                    v-model="registerForm.password"
                    @blur="markAsTouched('password')"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :placeholder="$t('register-workshop.passwordPlaceholder')"
                    class="input password-input"
                    :class="{ error: formErrors.password }"
                />
                <button
                    type="button"
                    class="password-toggle"
                    @click="togglePasswordVisibility"
                    :aria-label="$t('register-workshop.togglePassword')"
                >
                  <svg class="icon">
                    <use :href="isPasswordVisible ? '/assets/icons/sprite.symbol.svg#eye-off' : '/assets/icons/sprite.symbol.svg#eye'"></use>
                  </svg>
                </button>
              </div>
              <span v-if="formErrors.password" class="error-message">{{ formErrors.password }}</span>
            </div>

            <button type="submit" class="submit" :disabled="!isFormValid">
              {{ $t('register-workshop.register') }}
            </button>
          </form>
        </div>

        <div class="register-image-section">
          <img src="/assets/images/register-workshop.webp" alt="Car Owner" class="register-image" />
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