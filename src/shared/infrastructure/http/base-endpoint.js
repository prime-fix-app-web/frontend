import {BaseApiConfig} from "@/shared/infrastructure/http/base-api-config.js";
import {apiConfig} from "@/shared/infrastructure/http/api-config.js";

/**
 * BaseEndpoint class to handle common API endpoint operations.
 * @class
 */
export class BaseEndpoint {
    #idQueryParamKey;
    /**
     * Creates an instance of BaseEndpoint.
     * @param baseApi - The base API instance.
     * @param endpointPath - The specific endpoint path.
     * @param config - Configuration object for the endpoint.
     * @param {boolean} config.usePathParams - Whether to use path params or query params (defaults to apiConfig).
     * @param {string} config.idQueryParamKey - The query parameter key for ID operations.
     */
    constructor(baseApi, endpointPath, config = {}) {
        this.http = baseApi.http;
        this.httpFallback = baseApi.httpFallback;
        this.endpointPath = endpointPath;
        this.config = new BaseApiConfig(config);
        this.#idQueryParamKey = config.idQueryParamKey || 'id';
    }

    /**
     * Determines if should use path params for the current request
     * @param {import('axios').AxiosInstance} httpClient - The HTTP client being used
     * @returns {boolean}
     */
    #shouldUsePathParams(httpClient) {
        const baseURL = httpClient.defaults.baseURL || '';
        return apiConfig.shouldUsePathParams(baseURL);
    }

    /**
     * Fetches all resources from the endpoint.
     * @returns {*} - The list of all resources.
     */
    getAll() {
        const usePathParams = this.#shouldUsePathParams(this.http);
        let url = this.endpointPath;

        // Supabase (PostgREST) requires select=* for query params
        if (!usePathParams) {
            url += '?select=*';
        }

        return this.http.get(url);
    }

    /**
     * Fetches a resource by its ID.
     * @param id - The ID of the resource.
     * @returns {*} - The fetched resource.
     */
    getById(id) {
        const usePathParams = this.#shouldUsePathParams(this.http);
        let url = this.endpointPath;

        if (usePathParams) {
            // AWS style: /users/1
            url += `/${id}`;
        } else {
            // Supabase (PostgREST) style: /users?id=eq.1
            url += `?${this.#idQueryParamKey}=eq.${id}`;
        }

        return this.http.get(url);
    }

    /**
     * Fetches resources filtered by a specific field value.
     * @param {string} fieldName - The name of the field to filter by
     * @param {*} value - The value to filter for
     * @returns {*} - The fetched resources matching the filter
     */
    getByField(fieldName, value) {
        const usePathParams = this.#shouldUsePathParams(this.http);
        let url = this.endpointPath;

        if (usePathParams) {
            // AWS style: /service_offers?auto_repair_id=1
            url += `?${fieldName}=${value}`;
        } else {
            // Supabase (PostgREST) style: /service_offers?auto_repair_id=eq.1&select=*
            url += `?${fieldName}=eq.${value}&select=*`;
        }

        return this.http.get(url);
    }

    /**
     * Creates a new resource.
     * @param resource - The resource data to create.
     * @returns {*} - The created resource.
     */
    async create(resource) {
        const url = this.endpointPath;
        const usePathParams = this.#shouldUsePathParams(this.http);

        // Clean payload: remove id if it's null, undefined, or 0
        const payload = { ...resource };
        if (payload.id === null || payload.id === undefined || payload.id === 0) {
            delete payload.id;
        }

        try {
            const response = await this.http.post(url, payload);

            // Handle response based on provider
            if (usePathParams) {
                // AWS: Response is typically the created object directly
                // response.data = { id: 1, color: "red", ... }
                return response;
            } else {
                // Supabase (PostgREST): Response is an array with the created object
                // response.data = [{ id: 1, color: "red", ... }]
                // We need to wrap it to maintain consistency
                if (Array.isArray(response.data) && response.data.length > 0) {
                    // Already in correct format
                    return response;
                } else if (response.data && !Array.isArray(response.data)) {
                    // Single object, wrap it in an array for consistency
                    return {
                        ...response,
                        data: [response.data]
                    };
                }
                return response;
            }
        } catch (error) {
            // Try fallback if primary fails (only if fallback is available)
            if (this.httpFallback && error.response?.status >= 500) {
                console.warn(`Primary POST failed, trying fallback for ${url}`);
                // Supabase fallback returns array
                return await this.httpFallback.post(url, resource);
            }
            throw error;
        }
    }

    /**
     * Updates an existing resource by its ID.
     * @param id - The ID of the resource to update.
     * @param resource - The updated resource data.
     * @returns {*} - The response from the update operation.
     */
    update(id, resource) {
        const usePathParams = this.#shouldUsePathParams(this.http);
        let url = this.endpointPath;
        let payload = { ...resource };

        console.log('[BaseEndpoint] update called with:', { id, resource, usePathParams });
        console.log('[BaseEndpoint] endpointPath:', this.endpointPath);

        if (usePathParams) {
            // AWS style: PUT /users/1
            url += `/${id}`;
            console.log('[BaseEndpoint] AWS PUT URL:', url);
            console.log('[BaseEndpoint] Payload to send:', payload);
            return this.http.put(url, payload);
        } else {
            // Supabase (PostgREST) style: PATCH /users?id=eq.1
            url += `?${this.#idQueryParamKey}=eq.${id}`;
            console.log('[BaseEndpoint] Supabase PATCH URL:', url);
            console.log('[BaseEndpoint] Payload to send:', payload);
            return this.http.patch(url, payload);
        }
    }

    /**
     * Deletes a resource by its ID.
     * @param id - The ID of the resource to delete.
     * @returns {*} - The response from the delete operation.
     */
    delete(id) {
        const usePathParams = this.#shouldUsePathParams(this.http);
        let url = this.endpointPath;

        if (usePathParams) {
            // AWS style: DELETE /users/1
            url += `/${id}`;
        } else {
            // Supabase (PostgREST) style: DELETE /users?id=eq.1
            url += `?${this.#idQueryParamKey}=eq.${id}`;
        }

        return this.http.delete(url);
    }

}