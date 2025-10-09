/**
 * BaseEndpoint class to handle common API endpoint operations.
 * @class
 */
export class BaseEndpoint {
    /**
     * Creates an instance of BaseEndpoint.
     * @param baseApi - The base API instance.
     * @param endpointPath - The specific endpoint path.
     */
    constructor(baseApi, endpointPath) {
        this.http = baseApi.http;
        this.endpointPath = endpointPath;
    }

    /**
     * Fetches all resources from the endpoint.
     * @returns {*} - The list of all resources.
     */
    getAll() {
        return this.http.get(this.endpointPath);
    }

    /**
     * Fetches a resource by its ID.
     * @param id - The ID of the resource.
     * @returns {*} - The fetched resource.
     */
    getById(id) {
        return this.http.get(`${this.endpointPath}/${id}`);
    }

    /**
     * Creates a new resource.
     * @param resource - The resource data to create.
     * @returns {*} - The created resource.
     */
    create(resource) {
        return this.http.post(this.endpointPath, resource);
    }

    /**
     * Updates an existing resource by its ID.
     * @param id - The ID of the resource to update.
     * @param resource - The updated resource data.
     * @returns {*} - The response from the update operation.
     */
    update(id, resource) {
        return this.http.put(`${this.endpointPath}/${id}`, resource);
    }

    /**
     * Deletes a resource by its ID.
     * @param id - The ID of the resource to delete.
     * @returns {*} - The response from the delete operation.
     */
    delete(id) {
        return this.http.delete(`${this.endpointPath}/${id}`);
    }
}