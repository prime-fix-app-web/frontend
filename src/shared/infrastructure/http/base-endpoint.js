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
     * @param {string} config.usePathParams - Whether to use path params or query params.
     * @param {string} config.idQueryParamKey - The query parameter key for ID operations.
     */
    constructor(baseApi, endpointPath, config = {}) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
        this.config = new BaseApiConfig(config);
        this.#idQueryParamKey = config.idQueryParamKey || 'id';
    }

    /**
     * Fetches all resources from the endpoint.
     * @returns {*} - The list of all resources.
     */
    getAll() {
        let url = this.endpointPath;
        if (this.config.usePathParams === 'true') {
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
        let url = this.endpointPath;
        if (this.config.usePathParams === 'false') {
            url += `/${id}`;
        } else {
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
        const headers = { Prefer: 'return=representation' };
        return this.http.post(this.endpointPath, resource, { headers });
    }

    /**
     * Updates an existing resource by its ID.
     * @param id - The ID of the resource to update.
     * @param resource - The updated resource data.
     * @returns {*} - The response from the update operation.
     */
    update(id, resource) {
        let url = this.endpointPath;
        if (this.config.usePathParams === 'false') {
            url += `/${id}`;
            return this.http.put(url, resource);
        } else {
            url += `?${this.#idQueryParamKey}=eq.${id}`;
            return this.http.patch(url, resource);
        }
    }

    /**
     * Deletes a resource by its ID.
     * @param id - The ID of the resource to delete.
     * @returns {*} - The response from the delete operation.
     */
    delete(id) {
        let url = this.endpointPath;
        if (this.config.usePathParams === 'true') {
            url += `?${this.#idQueryParamKey}=eq.${id}`;
            return this.http.delete(url);
        }
        url += `/${id}`;
        return this.http.delete(url);
    }
}