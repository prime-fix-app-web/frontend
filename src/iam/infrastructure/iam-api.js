import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const locationsEndpointPath = import.meta.env.VITE_LOCATIONS_ENDPOINT_PATH;
const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const userAccountsEndpointPath = import.meta.env.VITE_USER_ACCOUNTS_ENDPOINT_PATH;

// Query param keys from environment
const locationQueryParamKey = import.meta.env.VITE_LOCATION_QUERY_PARAM_KEY;
const paymentQueryParamKey = import.meta.env.VITE_PAYMENT_QUERY_PARAM_KEY;
const userQueryParamKey = import.meta.env.VITE_USER_QUERY_PARAM_KEY;
const userAccountQueryParamKey = import.meta.env.VITE_USER_ACCOUNT_QUERY_PARAM_KEY;

/**
 * @class
 * @extends BaseApi
 * @description This class is responsible for making API calls to the IAM service.
 * It extends the BaseApi class and uses BaseEndpoint instances for each resource.
 */
export class IamApi extends BaseApi {
    /**
     * The endpoint for locations.
     * @type {BaseEndpoint}
     * @private
     */
    #locationsEndpoint;

    /**
     * The endpoint for payments.
     * @type {BaseEndpoint}
     * @private
     */
    #paymentsEndpoint;

    /**
     * The endpoint for users.
     * @type {BaseEndpoint}
     * @private
     */
    #usersEndpoint;

    /**
     * The endpoint for user accounts.
     * @type {BaseEndpoint}
     * @private
     */
    #userAccountsEndpoint;

    /**
     * @constructor
     * @description Initializes the IamApi instance and its endpoints.
     */
    constructor() {
        super();
        this.#locationsEndpoint = new BaseEndpoint(this, locationsEndpointPath, {
            usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey: locationQueryParamKey
        });
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath, {
            usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey: paymentQueryParamKey
        });
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath, {
            usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey: userQueryParamKey
        });
        this.#userAccountsEndpoint = new BaseEndpoint(this, userAccountsEndpointPath, {
            usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey: userAccountQueryParamKey
        });
    }

    /**
     * Fetches all locations from the API.
     * @returns {Promise<import('axios').AxiosReponse>} A promise that resolves to the API response.
     */
    getLocations() {
        return this.#locationsEndpoint.getAll();
    }

    /**
     * Fetches a location by its ID.
     * @param id - The ID of the location to fetch.
     * @returns {Promise<import('axios').AxiosReponse>} A promise that resolves to the API response.
     */
    getLocationById(id) {
        return this.#locationsEndpoint.getById(id);
    }

    /**
     * Creates a new location.
     * @param resource - The location resource to create.
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    createLocation(resource) {
        return this.#locationsEndpoint.create(resource);
    }

    /**
     * Updates an existing location.
     * @param resource - The location resource to update.
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    updateLocation(resource) {
        return this.#locationsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a location by its ID.
     * @param id - The ID of the location to delete.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    deleteLocation(id) {
        return this.#locationsEndpoint.delete(id);
    }

    /**
     * Fetches all payments from the API.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    getPayments() {
        return this.#paymentsEndpoint.getAll();
    }

    /**
     * Fetches a payment by its ID.
     * @param id - The ID of the payment to fetch.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    getPaymentById(id) {
        return this.#paymentsEndpoint.getById(id);
    }

    /**
     * Creates a new payment.
     * @param resource - The payment resource to create.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    createPayment(resource) {
        return this.#paymentsEndpoint.create(resource);
    }

    /**
     * Updates an existing payment.
     * @param resource - The payment resource to update.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    updatePayment(resource) {
        return this.#paymentsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a payment by its ID.
     * @param id - The ID of the payment to delete.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    deletePayment(id) {
        return this.#paymentsEndpoint.delete(id);
    }

    /**
     * Fetches all users.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    /**
     * Fetches a user by ID.
     * @param id - The ID of the user to fetch.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    getUserById(id) {
        return this.#usersEndpoint.getById(id);
    }

    /**
     * Creates a new user.
     * @param resource - The user resource to create.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    createUser(resource) {
        return this.#usersEndpoint.create(resource);
    }

    /**
     * Updates an existing user.
     * @param resource - The user resource to update.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    updateUser(resource) {
        return this.#usersEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a user by ID.
     * @param id - The ID of the user to delete.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    deleteUser(id) {
        return this.#usersEndpoint.delete(id);
    }

    /**
     * Fetches all user accounts.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    getUserAccounts() {
        return this.#userAccountsEndpoint.getAll();
    }

    /**
     * Fetches a user account by ID.
     * @param id - The ID of the user account to fetch.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    getUserAccountById(id) {
        return this.#userAccountsEndpoint.getById(id);
    }

    /**
     * Creates a new user account.
     * @param resource - The user account resource to create.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    createUserAccount(resource) {
        return this.#userAccountsEndpoint.create(resource);
    }

    /**
     * Updates an existing user account.
     * @param resource - The user account resource to update.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    updateUserAccount(resource) {
        return this.#userAccountsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a user account by ID.
     * @param id - The ID of the user account to delete.
     * @returns {Promise<import('axios').AxiosResponse>} - A promise that resolves to the API response.
     */
    deleteUserAccount(id) {
        return this.#userAccountsEndpoint.delete(id);
    }
}