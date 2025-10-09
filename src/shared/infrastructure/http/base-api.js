import axios from "axios";

const primeFixApi = import.meta.env.VITE_PRIMEFIX_PLATFORM_API_URL;

/**
 * Base API class to handle HTTP requests using Axios
 * @class
 */
export class BaseApi {
    /**
     * @private
     * Axios HTTP client instance
     * @type {import('axios').AxiosInstance}
     */
    #http;

    /**
     * Initializes the Axios HTTP client with the base URL from environment variables
     */
    constructor() {
        this.#http = axios.create({
            baseURL: primeFixApi
        });
    }

    /**
     * Gets the Axios HTTP client instance
     * @returns {axios.AxiosInstance}
     */
    get http() {
        return this.#http;
    }

}