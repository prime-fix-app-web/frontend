import {PaymentServiceApi} from "@/payment-service/infrastructure/payment-service-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {PaymentAssembler} from "@/payment-service/infrastructure/payment.assembler.js";
import {RatingAssembler} from "@/payment-service/infrastructure/rating.assembler.js";

/**
 * Singleton instance of PaymentServiceApi to be used across the store.
 * @type {PaymentServiceApi}
 */

const paymentServiceApi = new PaymentServiceApi()

const usePaymentStore = defineStore('payment-service',() => {

    /**
     * List of payments.
     * @type {import('vue').Ref<Payment[]>}
     */
    const payments = ref([]);
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
     * Indicates if payments have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const paymentsLoaded = ref(false);
    /**
     * Indicates if ratings have been loaded.
     * @type {import('vue').Ref<boolean>}
     */
    const ratingsLoaded = ref(false);
    /**
     * Count of payments.
     * @type {import('vue').ComputedRef<number>}
     */
    const paymentsCount = computed(() => {
        return paymentsLoaded ? payments.value.length : 0;
    });
    /**
     * Count of ratings.
     * @type {import('vue').ComputedRef<number>}
     */
    const ratingsCount = computed(() => {
        return ratingsLoaded ? ratings.value.length : 0;
    });



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
        payments,
        ratings,
        paymentsLoaded,
        ratingsLoaded,
        paymentsCount,
        ratingsCount,
        fetchPayments,
        fetchRatings,
        getPaymentById,
        getRatingById,
        addPayment,
        addRating,
        updatePayment,
        updateRating,
        deletePayment,
        deleteRating
    };
})

export default usePaymentStore;