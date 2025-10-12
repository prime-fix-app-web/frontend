import {BaseApiConfig} from "@/shared/infrastructure/http/base-api-config.js";

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
     * @param {boolean} config.useQueryParams - Whether to use path params or query params.
     * @param {string} config.idQueryParamKey - The query parameter key for ID operations.
     */
    constructor(baseApi, endpointPath, config = {}) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
        this.useQueryParams = !!config.idQueryParamKey;
        this.#idQueryParamKey = config.idQueryParamKey || 'id';
    }

    /**
     * Fetches all resources from the endpoint.
     * @returns {Promise<*>} - An array of all resources.
     */
    async getAll() {
        let url = this.endpointPath;
        if (!this.useQueryParams) {
            url += (url.includes('?') ? '&' : '?') + 'select=*';
        }
        return this.http.get(url);
    }

    /**
     * Fetches a resource by its ID.
     * @param id - The ID of the resource to fetch.
     * @returns {Promise<*>} - The resource with the specified ID.
     */
    async getById(id) {
        let url = this.endpointPath;
        if (!this.useQueryParams) {
            const key = encodeURIComponent(this.#idQueryParamKey);
            const val = encodeURIComponent(id);
            url += `${url.includes('?') ? '&' : '?'}${key}=eq.${val}`;
        } else {
            url += `/${encodeURIComponent(id)}`;
        }
        return this.http.get(url);
    }

    /**
     * Creates a new resource.
     * @param resource - The resource data to create.
     * @returns {Promise<*>} - The response from the create operation.
     */
    async create(resource) {
        const url = this.endpointPath;
        return this.http.post(url, resource);
    }

    /**
     * Updates an existing resource by its ID.
     * @param id - The ID of the resource to update.
     * @param resource - The updated resource data.
     * @returns {Promise<*>} - The response from the update operation.
     */
    async update(id, resource) {
        let url = this.endpointPath;

        if (!this.useQueryParams) {
            const val = encodeURIComponent(id);
            const key = encodeURIComponent(this.#idQueryParamKey);
            url += `${url.includes('?') ? '&' : '?'}${key}=eq.${val}`;
        } else {
            url += `/${encodeURIComponent(id)}`;
        }
        return this.http.put(url, resource);
    }

    /**
     * Deletes a resource by its ID.
     * @param id - The ID of the resource to delete.
     * @returns {Promise<*>} - The response from the delete operation.
     */
    async delete(id) {
        let url = this.endpointPath;
        // When using query params
        if (!this.useQueryParams) {
            const key = encodeURIComponent(this.#idQueryParamKey);
            const val = encodeURIComponent(id);
            url += `${url.includes('?') ? '&' : '?'}${key}=eq.${val}`;
        } else {
            // Traditional REST API style with path params
            url += `/${encodeURIComponent(id)}`;
        }
        return this.http.delete(url);
    }
}