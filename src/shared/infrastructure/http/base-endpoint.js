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
     * Creates a new resource.
     * @param resource - The resource data to create.
     * @returns {*} - The created resource.
     */
    create(resource) {
        const url = this.endpointPath;
        return this.http.post(url, resource);
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
        const payload = { ...resource };

        if (usePathParams) {
            // AWS style: PUT/PATCH /users/1
            url += `/${id}`;
            return this.http.patch(url, payload);
        } else {
            // Supabase (PostgREST) style: PATCH /users?id=eq.1
            url += `?${this.#idQueryParamKey}=eq.${id}`;
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