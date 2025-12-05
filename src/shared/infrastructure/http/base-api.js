import axios from "axios";
import { apiConfig } from "./api-config.js";
import { setupAuthInterceptor } from "./interceptors/auth.interceptor.js";

/**
 * Base API class to handle HTTP requests using Axios
 * Supports AWS primary with Supabase fallback strategy
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
     * @private
     * Fallback Axios HTTP client instance (for Supabase when AWS fails)
     * @type {import('axios').AxiosInstance|null}
     */
    #httpFallback;

    /**
     * Initializes the Axios HTTP client with the base URL from environment variables
     */
    constructor() {
        // Primary HTTP client (AWS or json-server in development)
        this.#http = axios.create({
            baseURL: apiConfig.currentBaseUrl
        });

        // Fallback HTTP client (Supabase when AWS is primary)
        if (apiConfig.isAwsPrimary && apiConfig.fallbackUrl) {
            this.#httpFallback = axios.create({
                baseURL: apiConfig.fallbackUrl
            });
        } else {
            this.#httpFallback = null;
        }

        // Apply auth interceptors
        this.#applyAuthInterceptor();
    }

    /**
     * Applies the external auth interceptor to this axios instance
     * @private
     */
    #applyAuthInterceptor() {
        // Setup interceptor for primary client
        setupAuthInterceptor({
            apiConfig: apiConfig,
            axiosInstance: this.#http,
            isPrimary: true
        });

        // Setup interceptor for fallback client (Supabase)
        if (this.#httpFallback) {
            setupAuthInterceptor({
                apiConfig: apiConfig,
                axiosInstance: this.#httpFallback,
                isPrimary: false
            });
        }
    }

    /**
     * Gets the Axios HTTP client instance
     * @returns {import('axios').AxiosInstance}
     */
    get http() {
        return this.#http;
    }

    /**
     * Gets the fallback Axios HTTP client instance
     * @returns {import('axios').AxiosInstance|null}
     */
    get httpFallback() {
        return this.#httpFallback;
    }
}

