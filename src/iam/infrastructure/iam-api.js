import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const locationsEndpointPath = import.meta.env.VITE_LOCATIONS_ENDPOINT_PATH;
const paymentsEndpointPath = import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH;
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH;
const userAccountsEndpointPath = import.meta.env.VITE_USER_ACCOUNTS_ENDPOINT_PATH;

export class IamApi extends BaseApi{
    #locationsEndpoint;
    #paymentsEndpoint;
    #usersEndpoint;
    #userAccountsEndpoint;

    constructor() {
        super();
        this.#locationsEndpoint = new BaseEndpoint(this, locationsEndpointPath)
        this.#paymentsEndpoint = new BaseEndpoint(this, paymentsEndpointPath)
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath)
        this.#userAccountsEndpoint = new BaseEndpoint(this, userAccountsEndpointPath)
    }

    getLocations() {
        return this.#locationsEndpoint.getAll();
    }

    getLocationById(id) {
        return this.#locationsEndpoint.getById(id);
    }

    createLocation(resource) {
        return this.#locationsEndpoint.create(resource);
    }

    updateLocation(resource) {
        return this.#locationsEndpoint.update(resource.id, resource);
    }

    deleteLocation(id) {
        return this.#locationsEndpoint.delete(id);
    }

    getPayments() {
        return this.#paymentsEndpoint.getAll();
    }

    getPaymentById(id) {
        return this.#paymentsEndpoint.getById(id);
    }

    createPayment(resource) {
        return this.#paymentsEndpoint.create(resource);
    }

    updatePayment(resource) {
        return this.#paymentsEndpoint.update(resource.id, resource);
    }

    deletePayment(id) {
        return this.#paymentsEndpoint.delete(id);
    }

    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    getUserById(id) {
        return this.#usersEndpoint.getById(id);
    }

    createUser(resource) {
        return this.#usersEndpoint.create(resource);
    }

    updateUser(resource) {
        return this.#usersEndpoint.update(resource.id, resource);
    }

    deleteUser(id) {
        return this.#usersEndpoint.delete(id);
    }

    getUserAccounts() {
        return this.#userAccountsEndpoint.getAll();
    }

    getUserAccountById(id) {
        return this.#userAccountsEndpoint.getById(id);
    }

    createUserAccount(resource) {
        return this.#userAccountsEndpoint.create(resource);
    }

    updateUserAccount(resource) {
        return this.#userAccountsEndpoint.update(resource.id, resource);
    }

    deleteUserAccount(id) {
        return this.#userAccountsEndpoint.delete(id);
    }
}