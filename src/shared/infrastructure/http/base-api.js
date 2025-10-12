import axios from "axios";
import { setupAuthInterceptor } from "./interceptors/auth.interceptor.js";

const baseUrl = import.meta.env.VITE_PRIMEFIX_PLATFORM_API_URL;
const apiKey = import.meta.env.VITE_PRIMEFIX_PLATFORM_API_KEY;

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
            baseURL: baseUrl
        });
        // Apply external auth interceptor to THIS specific axios instance
        this.#applyAuthInterceptor();
    }

    /**
     * Applies the external auth interceptor to this axios instance
     * @private
     */
    #applyAuthInterceptor() {
        setupAuthInterceptor({
            apiKey: apiKey,
            baseUrl: baseUrl,
            axiosInstance: this.#http
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