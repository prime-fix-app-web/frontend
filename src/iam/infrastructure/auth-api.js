import { BaseApi } from "@/shared/infrastructure/http/base-api.js";
import { apiConfig } from "@/shared/infrastructure/http/api-config.js";

/**
 * Authentication API service for AWS backend.
 * Handles sign-in and sign-up operations that return JWT tokens.
 *
 * @class
 * @extends BaseApi
 */
export class AuthApi extends BaseApi {
    /**
     * Initializes the Authentication API
     */
    constructor() {
        super();

        this.signInPath = apiConfig.endpoints.authSignIn;
        this.signUpVehicleOwnerPath = apiConfig.endpoints.authSignUpOwner;
        this.signUpAutoRepairPath = apiConfig.endpoints.authSignUpWorkshop;
    }

    /**
     * Sign in a user and receive JWT token
     * @param {string} username - User's username or email
     * @param {string} password - User's password
     * @returns {Promise<SignInResponse>} Promise with user id, username, and JWT token
     *
     * @typedef {Object} SignInRequest
     * @property {string} username - User's username
     * @property {string} password - User's password
     *
     * @typedef {Object} SignInResponse
     * @property {number} id - User account ID
     * @property {string} username - Username
     * @property {string} token - JWT token
     */
    async signIn(username, password) {
        try {
            const url = this.signInPath;
            const payload = { username, password };

            const response = await this.http.post(url, payload);
            return response.data;
        } catch (error) {
            throw this.#handleError('Sign-in failed', error);
        }
    }

    /**
     * Sign up a new vehicle owner
     * Creates User + UserAccount in the backend
     * @param {SignUpVehicleOwnerRequest} request - Sign-up request data with user and userAccount
     * @returns {Promise<SignUpResponse>} Promise with user account id, username, and JWT token
     *
     * @typedef {Object} SignUpVehicleOwnerRequest
     * @property {Object} user - User information
     * @property {string} user.name - User's first name
     * @property {string} user.lastName - User's last name
     * @property {string} user.dni - User's DNI/ID number
     * @property {string} user.phoneNumber - User's phone number
     * @property {string} user.department - Department/region
     * @property {string} user.district - District
     * @property {string} user.address - Street address
     * @property {Object} userAccount - User account credentials
     * @property {string} userAccount.username - Username
     * @property {string} userAccount.email - Email address
     * @property {string} userAccount.password - Password
     *
     * @typedef {Object} SignUpResponse
     * @property {number} id - User account ID
     * @property {string} username - Username
     * @property {string} token - JWT token
     */
    async signUpVehicleOwner(request) {
        try {
            const url = this.signUpVehicleOwnerPath;
            const response = await this.http.post(url, request);
            return response.data;
        } catch (error) {
            throw this.#handleError('Vehicle owner registration failed', error);
        }
    }

    /**
     * Sign up a new auto repair workshop
     * Creates AutoRepair + Location + User + UserAccount in the backend
     * @param {SignUpAutoRepairRequest} request - Sign-up request data
     * @returns {Promise<SignUpResponse>} Promise with user account id, username, and JWT token
     *
     * @typedef {Object} SignUpAutoRepairRequest
     * @property {Object} autoRepair - Auto repair workshop information
     * @property {string} autoRepair.name - Workshop name
     * @property {string} autoRepair.ruc - RUC number
     * @property {Object} location - Workshop location
     * @property {string} location.department - Department/region
     * @property {string} location.district - District
     * @property {string} location.address - Street address
     * @property {Object} user - Workshop owner information
     * @property {string} user.name - Owner's first name
     * @property {string} user.lastName - Owner's last name
     * @property {string} user.phoneNumber - Owner's phone number
     * @property {Object} userAccount - User account credentials
     * @property {string} userAccount.username - Username
     * @property {string} userAccount.email - Email address
     * @property {string} userAccount.password - Password
     */
    async signUpAutoRepair(request) {
        try {
            const url = this.signUpAutoRepairPath;
            const response = await this.http.post(url, request);
            return response.data;
        } catch (error) {
            throw this.#handleError('Auto repair registration failed', error);
        }
    }

    /**
     * Handle HTTP errors from authentication operations
     * @private
     * @param {string} operation - The operation that failed
     * @param {Error} error - The error object from Axios
     * @returns {Error} Formatted error with descriptive message
     */
    #handleError(operation, error) {
        let errorMessage = operation;

        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            const responseData = error.response.data;

            if (status === 401) {
                errorMessage = `${operation}: Invalid credentials`;
            } else if (status === 400) {
                errorMessage = `${operation}: ${responseData?.message || 'Invalid request'}`;
            } else if (status === 409) {
                errorMessage = `${operation}: ${responseData?.message || 'User already exists'}`;
            } else if (status >= 500) {
                errorMessage = `${operation}: Server error. Please try again later.`;
            } else {
                errorMessage = `${operation}: ${error.response.statusText || 'Unexpected error'}`;
            }
        } else if (error.request) {
            // The request was made but no response was received
            errorMessage = `${operation}: No response from server. Please check your connection.`;
        } else {
            // Something happened in setting up the request that triggered an Error
            errorMessage = `${operation}: ${error.message || 'Request failed'}`;
        }

        console.error(`[AuthApi] ${errorMessage}`, error);
        return new Error(errorMessage);
    }
}

