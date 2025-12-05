import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;
const ratingsEndpointPath = import.meta.env.VITE_RATINGS_ENDPOINT_PATH;
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
    #ratingsEndpoint;

    /**
     * Initializes endpoints for payments, visits and ratings.
     */
    constructor() {
        super();
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
        });
        this.#ratingsEndpoint = new BaseEndpoint(this, ratingsEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
        });
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