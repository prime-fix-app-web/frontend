import {PaymentServiceApi} from "@/payment-service/infrastructure/payment-service-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {PaymentAssembler} from "@/payment-service/infrastructure/payment.assembler.js";
import {RatingAssembler} from "@/payment-service/infrastructure/rating.assembler.js";
import {VehicleAssembler} from "@/maintenance-tracking/infrastructure/vehicle.assembler.js";

/**
 * Singleton instance of PaymentServiceApi to be used across the store.
 * @type {PaymentServiceApi}
 */

const paymentServiceApi = new PaymentServiceApi()

const usePaymentServiceStore = defineStore('payment-service',() => {
    /**
     * List of vehicles.
     * @type {import('vue').Ref<Vehicle[]>}
     */
    const vehicles = ref([]);
    /**
     * List of payments.
     * @type {import('vue').Ref<Payment[]>}
     */
    const payments = ref([]);
    /**
     * List of visits.
     * @type {import('vue').Ref<Visit[]>}
     */
    const visits = ref([]);
    /**
     * List of ratings.
     * @type {import('vue').Ref<Rating[]>}
     */
    const ratings = ref([]);
    /**
     * List of errors.
     * @type {import('vue').Ref<Error[]>}
     */
    const errors = ref([]);

    /**
     * Indicates if vehicles have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const vehiclesLoaded = ref(false);
    /**
     * Indicates if payments have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const paymentsLoaded = ref(false);
    /**
     * Indicates if visits have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const visitsLoaded = ref(false);
    /**
     * Indicates if ratings have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const ratingsLoaded = ref(false);

    /**
     * Count of vehicles.
     * @type {import('vue').ComputedRef<number>}
     */
    const vehiclesCount = computed(() => {
        return vehiclesLoaded ? vehicles.value.length: 0;
    })
    /**
     * Count of payments.
     * @type {import('vue').ComputedRef<number>}
     */
    const paymentsCount = computed(() => {
        return paymentsLoaded ? payments.value.length : 0;
    });
    /**
     * Count of visits.
     * @type {import('vue').ComputedRef<number>}
     */
    const visitsCount = computed(() => {
        return visitsLoaded ? visits.value.length : 0;
    });
    /**
     * Count of ratings.
     * @type {import('vue').ComputedRef<number>}
     */
    const ratingsCount = computed(() => {
        return ratingsLoaded ? ratings.value.length : 0;
    });


    /**
     * Fetches vehicles from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchVehicles() {
        paymentServiceApi.getVehicles().then(response => {
            vehicles.value = VehicleAssembler.toEntitiesFromResponse(response);
            vehiclesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }
    /**
     * Gets a vehicle by its ID.
     * @function
     * @param id {string} id - The vehicle ID.
     * @returns {Vehicle} The found vehicle or undefined.
     */
    function getVehicleById(id) {
        return vehicles.value.find(vehicle => vehicle.id === id);
    }

    /**
     * Fetches payments from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchPayments() {
        paymentServiceApi.getPayments().then(response => {
            payments.value = PaymentAssembler.toEntitiesFromResponse(response);
            paymentsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Gets a payment by its ID.
     * @function
     * @param id {string} id - The payment ID.
     * @returns {Payment} The found category or undefined.
     */
    function getPaymentById(id) {
        return payments.value.find(payment => payment.id === id);
    }

    /**
     * Adds a new payment.
     * @param payment - The payment to add.
     * @return {void}
     */
    function addPayment(payment) {
        paymentServiceApi.createPayment(payment).then(response => {
            const resource = response.data;
            const newPayment = PaymentAssembler.toEntityFromResource(resource);
            payments.value.push(newPayment);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Updates an existing payment.
     * @param payment - The payment to update.
     * @return {void}
     */
    function updatePayment(payment) {
        paymentServiceApi.updatePayment(payment).then(response => {
            const resource = response.data;
            const updatedPayment = PaymentAssembler.toEntityFromResource(resource);
            const index = payments.value.findIndex(pay => pay.id === updatedPayment.id);
            if (index !== -1) payments.value[index] = updatedPayment;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Deletes a payment.
     * @param payment - The payment to delete.
     * @return {void}
     */
    function deletePayment(payment) {
        paymentServiceApi.deletePayment(payment.id).then(() => {
            const index = payments.value.findIndex(pay => pay.id === payment.id);
            if (index !== -1) payments.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Fetches visits from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchVisits() {
        paymentServiceApi.getVisits().then(response => {
            visits.value = VisitAssembler.toEntitiesFromResponse(response);
            visitsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Gets a visit by its ID.
     * @function
     * @param id {string} id - The payment ID.
     * @returns {Visit} The found visit or undefined.
     */
    function getVisitById(id) {
        return visits.value.find(visit => visit.id === id);
    }

    /**
     * Adds a new visit.
     * @param visit - The visit to add.
     * @return {void}
     */
    function addVisit(visit) {
        paymentServiceApi.createVisit(visit).then(response => {
            const resource = response.data;
            const newVisit = VisitAssembler.toEntityFromResource(resource);
            visits.value.push(newVisit);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Updates an existing visit.
     * @param visit - The visit to update.
     * @return {void}
     */
    function updateVisit(visit) {
        paymentServiceApi.updateVisit(visit).then(response => {
            const resource = response.data;
            const updatedVisit = VisitAssembler.toEntityFromResource(resource);
            const index = visits.value.findIndex(vis => vis.id === updatedVisit.id);
            if (index !== -1) visits.value[index] = updatedVisit;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Deletes a visit.
     * @param visit - The visit to delete.
     * @return {void}
     */
    function deleteVisit(visit) {
        paymentServiceApi.deleteVisit(visit.id).then(() => {
            const index = visits.value.findIndex(vis => vis.id === visit.id);
            if (index !== -1) visits.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }
    /**
     * Fetches ratings from the API and updates state.
     * @function
     * @returns {void}
     */
    function fetchRatings() {
        paymentServiceApi.getRatings().then(response => {
            ratings.value = RatingAssembler.toEntitiesFromResponse(response);
            ratingsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Gets a rating by its ID.
     * @function
     * @param id {string} id - The rating ID.
     * @returns {Rating} The found rating or undefined.
     */
    function getRatingById(id) {
        return ratings.value.find(rating => rating.id === id);
    }

    /**
     * Adds a new rating.
     * @param rating - The rating to add.
     * @return {void}
     */
    function addRating(rating) {
        paymentServiceApi.createRating(rating).then(response => {
            const resource = response.data;
            const newRating = RatingAssembler.toEntityFromResource(resource);
            ratings.value.push(newRating);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Updates an existing rating.
     * @param rating - The rating to update.
     * @return {void}
     */
    function updateRating(rating) {
        paymentServiceApi.updateRating(rating).then(response => {
            const resource = response.data;
            const updatedRating = RatingAssembler.toEntityFromResource(resource);
            const index = ratings.value.findIndex(rate => rate.id === updatedRating.id);
            if (index !== -1) ratings.value[index] = updatedRating;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    /**
     * Deletes a rating.
     * @param rating - The payment to delete.
     * @return {void}
     */
    function deleteRating(rating) {
        paymentServiceApi.deleteRating(rating.id).then(() => {
            const index = ratings.value.findIndex(rate => rate.id === rating.id);
            if (index !== -1) ratings.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    return {
        vehicles,
        payments,
        visits,
        ratings,
        vehiclesLoaded,
        paymentsLoaded,
        visitsLoaded,
        ratingsLoaded,
        vehiclesCount,
        paymentsCount,
        visitsCount,
        ratingsCount,
        fetchVehicles,
        fetchPayments,
        fetchVisits,
        fetchRatings,
        getVehicleById,
        getPaymentById,
        getVisitById,
        getRatingById,
        addPayment,
        addVisit,
        addRating,
        updatePayment,
        updateVisit,
        updateRating,
        deletePayment,
        deleteVisit,
        deleteRating
    };
})

export default usePaymentServiceStore;