import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const locationsEndpointPath = import.meta.env.VITE_LOCATIONS_ENDPOINT_PATH ;
const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH ;
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const userAccountsEndpointPath = import.meta.env.VITE_USER_ACCOUNTS_ENDPOINT_PATH;

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
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath, {
            usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
        });
        this.#userAccountsEndpoint = new BaseEndpoint(this, userAccountsEndpointPath, {
            usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
        });
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