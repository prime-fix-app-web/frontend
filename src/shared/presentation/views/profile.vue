<script setup>
import { ref, computed, onMounted } from 'vue';
import { useIamStore } from '@/iam/application/iam.store.js';
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import {Location} from "@/auto-repair-catalog/domain/model/location.entity.js";
import {UserAccount} from "@/iam/domain/model/user-account.entity.js";
import carOwnerImg from "@/../public/assets/images/car_owner.png"
import managerWorkshopImg from "@/../public/assets/images/manager_workshop.png"
// Stores
const iamStore = useIamStore();
const catalogStore = useCatalogStore();

// Computed session data
const sessionUserAccount = computed(() => iamStore.sessionUserAccount);
const sessionUser = computed(() => iamStore.sessionUser);
const sessionLocation = computed(() =>
    catalogStore.getLocationById(sessionUser.value?.id_location)
);

// Profile fields
const profileImage = ref('');
const usernameToEdit = ref('');
const addressToEdit = ref('');
const passwordToEdit = ref('');

// UI State
const isEditMode = ref(false);
const showPassword = ref(false);

// Determine if owner
const isOwner = computed(() => sessionUserAccount.value?.id_role === 'R001');

// Initialize profile data on mount
onMounted(() => {
  usernameToEdit.value = sessionUserAccount.value?.username || '';
  addressToEdit.value = sessionLocation.value?.address || '';
  passwordToEdit.value = sessionUserAccount.value?.password || '';

  profileImage.value = isOwner.value
      ? 'assets/images/car_owner.png'
      : 'assets/images/manager_workshop.png';
});

// UI Actions
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const saveChanges = () => {
  const locationEdit = new Location({
    id_location: sessionLocation.value?.id_location,
    address: addressToEdit.value,
    district: sessionLocation.value?.district,
    department: sessionLocation.value?.department
  });

  const updatedUserAccount = new UserAccount({
    id_user_account: sessionUserAccount.value?.id,
    username: usernameToEdit.value,
    email: sessionUserAccount.value?.email,
    id_user: sessionUserAccount.value?.id_user,
    id_role: sessionUserAccount.value?.id_role,
    id_membership: sessionUserAccount.value?.id_membership,
    password: passwordToEdit.value,
    is_new: sessionUserAccount.value?.is_new
  });

  iamStore.updateLocation(locationEdit);
  iamStore.updateUserAccount(updatedUserAccount.id_user_account, updatedUserAccount);
  isEditMode.value = false;
};

const onImageChange = (event) => {
  const input = event.target;
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
};

onMounted(() => {
  if (sessionUserAccount.value) {
    usernameToEdit.value = sessionUserAccount.value.username || '';
    passwordToEdit.value = sessionUserAccount.value.password || '';

    if (sessionUser.value?.id_location) {
      const location = catalogStore.getLocationById(sessionUser.value.id_location);
      addressToEdit.value = location?.address || '';
    }
  }

  profileImage.value = isOwner.value ? carOwnerImg : managerWorkshopImg;
});

</script>

<template>
  <div class="profile-container">
    <div class="profile-header">
      <h1 class="profile-title">{{ $t('profile-view.title') }}</h1>
    </div>

    <div class="profile-content">
      <!-- Profile Image Section -->
      <div class="profile-image-section">
        <div class="profile-image-wrapper">
          <img
              :src="profileImage"
              alt="Profile"
              class="profile-image"
          />
          <label
              v-if="isEditMode"
              for="imageUpload"
              class="image-edit-icon"
          >
            <svg class="icon">
              <use href="/assets/icons/sprite.symbol.svg#edit"></use>
            </svg>
          </label>
          <input
              v-if="isEditMode"
              type="file"
              id="imageUpload"
              accept="image/*"
              @change="onImageChange"
              style="display: none;"
          />
        </div>

        <button
            class="btn-edit-profile"
            type="button"
            @click="toggleEditMode"
        >
          {{ isEditMode ? $t('profile-view.cancelEdit') : $t('profile-view.editProfile') }}
        </button>
      </div>

      <!-- Form Section -->
      <form class="profile-form" @submit.prevent="saveChanges">
        <!-- Username Field -->
        <div class="form-group">
          <label for="username" class="form-label">
            {{ $t('profile-view.username') }}
          </label>
          <input
              type="text"
              id="username"
              class="form-input"
              v-model="usernameToEdit"
              :disabled="!isEditMode"
              required
          />
        </div>

        <!-- Address Field -->
        <div class="form-group">
          <label for="address" class="form-label">
            {{ $t('profile-view.address') }}
          </label>
          <input
              type="text"
              id="address"
              class="form-input"
              v-model="addressToEdit"
              :disabled="!isEditMode"
              required
          />
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password" class="form-label">
            {{ $t('profile-view.password') }}
          </label>
          <div class="password-input-wrapper">
            <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                class="form-input"
                v-model="passwordToEdit"
                :disabled="!isEditMode"
                required
            />
            <button
                v-if="isEditMode"
                type="button"
                class="toggle-password-btn"
                @click="togglePasswordVisibility"
            >
              <svg class="icon-eye">
                <use :href="`/assets/icons/sprite.symbol.svg#${showPassword ? 'eye-off' : 'eye'}`"></use>
              </svg>
            </button>
          </div>
        </div>

        <!-- Save Button -->
        <div v-if="isEditMode" class="form-actions">
          <button type="submit" class="btn-save">
            {{ $t('profile-view.saveChanges') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.profile-header {
  border-bottom: 3px solid var(--color-primary);
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
}

.profile-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0;
}

.profile-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

/* Profile Image Section */
.profile-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.profile-image-wrapper {
  position: relative;
  width: 220px;
  height: 220px;
}

.profile-image {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  object-fit: cover;
  border: 6px solid var(--color-first-complementary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-edit-icon {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: var(--color-light);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
  border: 2px solid var(--color-primary);
}

.image-edit-icon:hover {
  transform: scale(1.1);
}

.image-edit-icon .icon {
  width: 20px;
  height: 20px;
  fill: var(--color-primary);
}

.btn-edit-profile {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.75rem 2.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
  min-width: 180px;
}

.btn-edit-profile:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.btn-edit-profile:active {
  transform: translateY(0);
}

/* Form Section */
.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: var(--font-medium);
  font-size: 1rem;
  color: var(--color-dark);
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 0.875rem 1rem;
  border: 2px solid var(--color-primary);
  border-radius: 25px;
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  background-color: var(--color-light);
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus:not(:disabled) {
  border-color: var(--color-first-complementary);
  box-shadow: 0 0 0 3px rgba(242, 170, 31, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Password Field */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  flex: 1;
  padding-right: 3rem;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.toggle-password-btn:hover {
  transform: scale(1.1);
}

.icon-eye {
  width: 24px;
  height: 24px;
  fill: var(--color-primary);
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.btn-save {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.875rem 3rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
}

.btn-save:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

.btn-save:active {
  transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-container {
    padding: 1rem;
  }

  .profile-title {
    font-size: 2rem;
  }

  .profile-content {
    gap: 2rem;
  }

  .profile-image-wrapper {
    width: 150px;
    height: 150px;
  }

  .profile-form {
    max-width: 100%;
  }

  .btn-edit-profile,
  .btn-save {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .profile-title {
    font-size: 1.5rem;
  }

  .profile-image-wrapper {
    width: 120px;
    height: 120px;
  }

  .form-input {
    padding: 0.75rem 0.875rem;
    font-size: 0.95rem;
  }
}
</style>