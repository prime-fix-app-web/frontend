import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;
const visitsEndpointPath = import.meta.env.VITE_VISITS_ENDPOINT_PATH;
const ratingsEndpointPath = import.meta.env.VITE_RATINGS_ENDPOINT_PATH;
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;

/**
 * PaymentServiceApi class to handle API operations for Payment-Service context.
 * Extends BaseApi and provides CRUD operations for categories and tutorials.
 *
 * @class
 * @extends BaseApi
 * @example
 * const paymentServiceApi = new PaymentServiceApi();
 * publishingApi.getPayments().then(response => console.log(response.data));
 */
export class PaymentServiceApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #paymentsEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #visitsEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #ratingsEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #vehiclesEndpoint;

    /**
     * Initializes endpoints for payments, visits and ratings.
     */
    constructor() {
        super();
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath);
        this.#visitsEndpoint = new BaseEndpoint(this, visitsEndpointPath);
        this.#ratingsEndpoint = new BaseEndpoint(this, ratingsEndpointPath);
        this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath);
    }
    /**
     * Fetches all vehicles.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the vehicles' response.
     */
    getVehicles() {
        return this.#vehiclesEndpoint.getAll();
    }

    /**
     * Fetches a payment by its ID.
     * @param {string} id - The ID of the payment.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the payment response.
     */
    getVehicleById(id) {
        return this.#vehiclesEndpoint.getById(id);
    }

    /**
     * Fetches all payments.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the payments' response.
     */
    getPayments() {
        return this.#paymentsEndpoint.getAll();
    }

    /**
     * Fetches a payment by its ID.
     * @param {string} id - The ID of the payment.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the payment response.
     */
    getPaymentById(id) {
        return this.#paymentsEndpoint.getById(id);
    }

    /**
     * Creates a new payment.
     * @param {Object} resource - The payment data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created payment response.
     */
    createPayment(resource) {
        return this.#paymentsEndpoint.create(resource);
    }

    /**
     * Updates an existing payment.
     * @param {Object} resource - The payment data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated payment response.
     */
    updatePayment(resource) {
        return this.#paymentsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a category by its ID.
     * @param {string} id - The ID of the payment to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deletePayment(id) {
        return this.#paymentsEndpoint.delete(id);
    }

    /**
     * Fetches all visits.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the visits' response.
     */
    getVisits() {
        return this.#visitsEndpoint.getAll();
    }

    /**
     * Fetches a visit by its ID.
     * @param {string} id - The ID of the visit.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the visit response.
     */
    getVisitById(id) {
        return this.#visitsEndpoint.getById(id);
    }

    /**
     * Creates a new visit.
     * @param {Object} resource - The visit data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created visit response.
     */
    createVisit(resource) {
        return this.#visitsEndpoint.create(resource);
    }

    /**
     * Updates an existing visit.
     * @param {Object} resource - The visit data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated visit response.
     */
    updateVisit(resource) {
        return this.#visitsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a visit by its ID.
     * @param {string} id - The ID of the visit to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteVisit(id) {
        return this.#visitsEndpoint.delete(id);
    }

    /**
     * Fetches all ratings.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the ratings' response.
     */
    getRatings() {
        return this.#ratingsEndpoint.getAll();
    }

    /**
     * Fetches a rating by its ID.
     * @param {string} id - The ID of the rating.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the rating response.
     */
    getRatingById(id) {
        return this.#paymentsEndpoint.getById(id);
    }

    /**
     * Creates a new rating.
     * @param {Object} resource - The rating data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created rating response.
     */
    createRating(resource) {
        return this.#paymentsEndpoint.create(resource);
    }

    /**
     * Updates an existing rating.
     * @param {Object} resource - The rating data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated rating response.
     */
    updateRating(resource) {
        return this.#paymentsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a rating by its ID.
     * @param {string} id - The ID of the rating to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteRating(id) {
        return this.#paymentsEndpoint.delete(id);
    }

}