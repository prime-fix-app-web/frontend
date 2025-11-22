<script setup>
import {ref, computed, onMounted} from 'vue';
import useDataCollection from "@/data-collection-diagnosis/application/data-collection.js";
import usePaymentStore from "@/payment-service/application/payment-service.store.js";
import useIamStore from "@/iam/application/iam.store.js";
import useCatalogStore from "@/auto-repair-catalog/application/owner.store.js";
import useTrackingStore from "@/maintenance-tracking/application/tracking.store.js";

// Stores
const dataCollectionStore = useDataCollection();
const paymentServiceStore = usePaymentStore();
const iamStore = useIamStore();
const catalogStore = useCatalogStore();
const trackingStore = useTrackingStore();

const showDetailsModal = ref(false);
const selectedExpectedVisitAndVisit = ref(null); // { expectedVisit, visit } | null

const sessionUserAccount = computed(() => iamStore.sessionUserAccount);

const currentAutoRepair = computed(() => {
  const userAccountId = sessionUserAccount.value?.id_user_account;
  if (!userAccountId || !catalogStore.autoRepairs.length) return null;
  return catalogStore.autoRepairs.find(ar => ar.id_user_account === userAccountId) || null;
});

const expectedVisitsScheduled = computed(() => {
  if (!currentAutoRepair.value || !dataCollectionStore.visits.length || !dataCollectionStore.expectedVisit.length)
    return [];

  const visitsByAutoRepair = dataCollectionStore.visits.filter(
      v => v.id_auto_repair === currentAutoRepair.value.id_auto_repair
  );

  return dataCollectionStore.expectedVisit.filter(ev =>
      visitsByAutoRepair.some(v => v.id_visit === ev.id_visit) // ignoramos is_scheduled
  );
});


const receivedRatings = computed(() => {
  return paymentServiceStore.ratings.filter(
      r => r.id_auto_repair === currentAutoRepair.value?.id_auto_repair
  );
});

// Methods
function getUserNameByUserAccountId(id_user_account) {
  return computed(() => {
    const accounts = iamStore.userAccounts || [];
    const userAccount = accounts.find(ua => ua.id_user_account === id_user_account);
    return userAccount ? userAccount.username : 'Unknown User';
  });
}

function getVisitByExpectedVisitId(id_expected_visit) {
  return computed(() => {
    const expectedVisits = dataCollectionStore.expectedVisit || [];
    const visits = dataCollectionStore.visits || [];

    const expectedVisit = expectedVisits.find(ev => ev.id_expected === id_expected_visit);
    if (!expectedVisit) return null;
    return visits.find(v => v.id_visit === expectedVisit.id_visit) || null;
  });
}

function getUserFullNameByVisitId(id_visit) {
  const visits = dataCollectionStore.visits || [];
  const vehicles = trackingStore.vehicles || [];
  const users = iamStore.users || [];

  const visit = visits.find(v => v.id_visit === id_visit);
  if (!visit) return 'Unknown User';

  const vehicle = vehicles.find(veh => veh.id_vehicle === visit.id_vehicle);
  if (!vehicle) return 'Unknown User';

  const user = users.find(u => u.id_user === vehicle.id_user);
  return user ? `${user.name} ${user.last_name}` : 'Unknown User';
}

function getVehicleByVehicleId(id_vehicle) {
  return computed(() => {
    const vehicles = trackingStore.vehicles || [];
    return vehicles.find(v => v.id_vehicle === id_vehicle) || null;
  });
}

// Modal actions
function onShowDetails(expectedVisit, visit) {
  selectedExpectedVisitAndVisit.value = { expectedVisit, visit };
  showDetailsModal.value = true;
}

function onCloseModal() {
  selectedExpectedVisitAndVisit.value = null;
  showDetailsModal.value = false;
}

// Get star representation
function getStars(rating) {
  return '⭐'.repeat(rating);
}

onMounted(async () => {
  await Promise.all([
    dataCollectionStore.fetchVisit(),
    dataCollectionStore.fetchServices(),
    dataCollectionStore.fetchDiagnostic(),
    dataCollectionStore.fetchExpected(),

    paymentServiceStore.fetchPayments(),
    paymentServiceStore.fetchRatings(),

    catalogStore.fetchAutoRepairs(),

    iamStore.fetchUsers(),
    iamStore.fetchUserAccounts(),

    trackingStore.fetchVehicles(),
  ]);
});
</script>

<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">{{ $t('dashboard-workshop.title') }}</h1>

    <section class="dashboard-section">
      <h2 class="section-title">{{ $t('dashboard-workshop.scheduledVisits') }}</h2>

      <div class="visits-list">
        <div
            v-for="expectedVisit in expectedVisitsScheduled"
            :key="expectedVisit.id_expected"
            class="visit-card"
        >
          <div class="visit-info">
            <h3 class="customer-name">
              {{ getUserFullNameByVisitId(expectedVisit.id_visit) }}
            </h3>
            <div class="visit-details">
              <p class="detail-item">
                <span class="detail-label">{{ $t('dashboard-workshop.date') }}:</span>
                {{ getVisitByExpectedVisitId(expectedVisit.id_expected).value?.time_visit?.slice(0,10) }}
              </p>
              <p class="detail-item">
                <span class="detail-label">{{ $t('dashboard-workshop.time') }}:</span>
                {{ getVisitByExpectedVisitId(expectedVisit.id_expected).value?.time_visit?.slice(11,16) }}
              </p>
            </div>
          </div>

          <button
              class="btn-details"
              @click="onShowDetails(expectedVisit, getVisitByExpectedVisitId(expectedVisit.id_expected).value)"
          >
            {{ $t('dashboard-workshop.details') }}
          </button>
        </div>

        <div v-if="expectedVisitsScheduled.length === 0" class="no-items">
          <p>{{ $t('dashboard-workshop.noScheduledVisits') }}</p>
        </div>
      </div>
    </section>

    <section class="dashboard-section">
      <h2 class="section-title">{{ $t('dashboard-workshop.receivedRatings') }}</h2>

      <div class="ratings-list">
        <div
            v-for="rating in receivedRatings"
            :key="rating.id"
            class="rating-card"
        >
          <div class="rating-header">
            <h3 class="customer-name">
              {{ $t('dashboard-workshop.client') }}: {{ getUserNameByUserAccountId(rating.id_user_account).value }}
            </h3>
            <p class="rating-date">
              {{ $t('dashboard-workshop.ratingDate') }}: {{ rating.time_rating }}
            </p>
          </div>

          <div class="rating-content">
            <div class="rating-score">
              <span class="rating-label">{{ $t('dashboard-workshop.rating') }}:</span>
              <span class="stars">{{ getStars(rating.star_rating) }}</span>
              <span class="rating-number">{{ rating.star_rating }}/5</span>
            </div>

            <div v-if="rating.comment" class="rating-comment">
              <p class="comment-label">{{ $t('dashboard-workshop.comment') }}:</p>
              <p class="comment-text">{{ rating.comment }}</p>
            </div>
          </div>
        </div>

        <div v-if="receivedRatings.length === 0" class="no-items">
          <p>{{ $t('dashboard-workshop.noRatings') }}</p>
        </div>
      </div>
    </section>
  </div>

  <!-- Visit Details Modal -->
  <div v-if="showDetailsModal && selectedExpectedVisitAndVisit" class="modal-overlay" @click="onCloseModal">
    <div class="modal-content" @click.stop>
      <h2 class="modal-title">{{ $t('dashboard-workshop.visitDetails') }}</h2>

      <div class="modal-details">
        <div class="detail-group">
          <label class="detail-label">{{ $t('dashboard-workshop.customerName') }}</label>
          <p class="detail-value">
            {{ getUserFullNameByVisitId(selectedExpectedVisitAndVisit.expectedVisit.id_visit) }}
          </p>
        </div>

        <div class="detail-group">
          <label class="detail-label">{{ $t('dashboard-workshop.vehicleModel') }}</label>
          <p class="detail-value">
            {{ getVehicleByVehicleId(selectedExpectedVisitAndVisit.visit.id_vehicle).value?.model }}
          </p>
        </div>

        <div class="detail-group">
          <label class="detail-label">{{ $t('dashboard-workshop.failures') }}</label>
          <p class="detail-value failure-text">
            {{ selectedExpectedVisitAndVisit.visit.failure }}
          </p>
        </div>

        <div class="detail-row">
          <div class="detail-group">
            <label class="detail-label">{{ $t('dashboard-workshop.date') }}</label>
            <p class="detail-value">
              {{ selectedExpectedVisitAndVisit.visit.time_visit?.slice(0,10) }}
            </p>
          </div>

          <div class="detail-group">
            <label class="detail-label">{{ $t('dashboard-workshop.time') }}</label>
            <p class="detail-value">
              {{ selectedExpectedVisitAndVisit.visit.time_visit?.slice(11,16) }}
            </p>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-close" @click="onCloseModal">
          {{ $t('dashboard-workshop.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  height: 100%;
  padding: 2rem;
  background-color: var(--color-light);
  overflow-y: auto;
}

.dashboard-title {
  font-family: var(--font-bold);
  font-size: 3rem;
  color: var(--color-primary);
  margin: 0 0 2rem 0;
  border-bottom: 3px solid var(--color-primary);
  padding-bottom: 0.5rem;
}

/* Dashboard Sections */
.dashboard-section {
  margin-bottom: 3rem;
}

.section-title {
  font-family: var(--font-semibold);
  font-size: 1.5rem;
  color: var(--color-dark);
  margin: 0 0 1.5rem 0;
}

/* Visits List */
.visits-list,
.ratings-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1000px;
}

.visit-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.visit-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.visit-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.customer-name {
  font-family: var(--font-semibold);
  font-size: 1.3rem;
  color: var(--color-dark);
  margin: 0;
}

.visit-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
}

.detail-label {
  font-family: var(--font-medium);
}

.btn-details {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
  min-width: 120px;
}

.btn-details:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

/* Ratings Cards */
.rating-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rating-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rating-date {
  font-family: var(--font-regular);
  font-size: 0.95rem;
  color: var(--color-dark);
  margin: 0;
}

.rating-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-score {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rating-label {
  font-family: var(--font-medium);
  font-size: 1rem;
  color: var(--color-dark);
}

.stars {
  font-size: 1.2rem;
}

.rating-number {
  font-family: var(--font-semibold);
  font-size: 1rem;
  color: var(--color-dark);
}

.rating-comment {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-label {
  font-family: var(--font-medium);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
}

.comment-text {
  font-family: var(--font-regular);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
  padding: 1rem;
  background-color: var(--color-light);
  border-radius: 8px;
  border: 1px solid var(--color-primary);
}

/* No Items Message */
.no-items {
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--color-second-complementary);
  border-radius: 12px;
  border: 2px solid var(--color-primary);
}

.no-items p {
  font-family: var(--font-regular);
  font-size: 1.1rem;
  color: var(--color-dark);
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-second-complementary);
  padding: 2rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 2px solid var(--color-primary);
}

.modal-title {
  font-family: var(--font-bold);
  font-size: 1.8rem;
  color: var(--color-primary);
  margin: 0 0 1.5rem 0;
  text-align: center;
}

.modal-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-label {
  font-family: var(--font-medium);
  font-size: 1rem;
  color: var(--color-dark);
  margin: 0;
}

.detail-value {
  font-family: var(--font-regular);
  font-size: 1.1rem;
  color: var(--color-dark);
  margin: 0;
  padding: 0.75rem 1rem;
  background-color: var(--color-light);
  border-radius: 25px;
  border: 2px solid var(--color-primary);
}

.failure-text {
  padding: 1rem;
  border-radius: 12px;
  min-height: 80px;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.btn-close {
  background-color: var(--color-first-complementary);
  color: var(--color-dark);
  border: none;
  padding: 0.875rem 2.5rem;
  border-radius: 25px;
  font-family: var(--font-semibold);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(242, 170, 31, 0.3);
}

.btn-close:hover {
  background-color: #e09a0f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(242, 170, 31, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .dashboard-title {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.25rem;
  }

  .visit-card {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .btn-details {
    width: 100%;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .btn-close {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard-title {
    font-size: 1.5rem;
  }

  .customer-name {
    font-size: 1.1rem;
  }

  .detail-item,
  .detail-value {
    font-size: 0.95rem;
  }
}
</style>