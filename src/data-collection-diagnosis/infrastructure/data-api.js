import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const visitsEndpointPath = import.meta.env.VITE_VISITS_ENDPOINT_PATH;
const serviceEndpointPath = import.meta.env.VITE_SERVICES_ENDPOINT_PATH;
const diagnosticEndpointPath = import.meta.env.VITE_DIAGNOSTIC_ENDPOINT_PATH;
const expectedVisitEndpointPath = import.meta.env.VITE_EXPECTED_ENDPOINT_PATH;

/**
 * DataApi class to handle API operations for Data manipulation and recollection context.
 * Extends BaseApi and provides CRUD operations for categories and tutorials.
 *
 * @class
 * @extends BaseApi
 * @example
 * const dataApi = new DataApi();
 * dataApi.getVehicles().then(response => console.log(response.data));
 */
export class DataApi extends BaseApi{
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #visitsEndpoint;
    /**
     * Initializes endpoints for visits, auto repairs,vehicles and services.
     */

    #expectedEndpoint;
    #diagnosticEndpoint;
    constructor(){
        super();
        this.#visitsEndpoint = new BaseEndpoint(this,visitsEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
        });
        this.#diagnosticEndpoint = new BaseEndpoint(this,diagnosticEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
        });
        this.#expectedEndpoint = new BaseEndpoint(this,expectedVisitEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
        })
    }

    getExpectedVisits(){
        return this.#expectedEndpoint.getAll();
    }

    getDiagnostic(){
        return this.#diagnosticEndpoint.getAll();
    }
    /**
     * Fetches all visits.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the visit response.
     */
    getVisits(){
        return this.#visitsEndpoint.getAll();
    }

    /**
     * Creates a new visit.
     * @param {Object} resource - The visit data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created visit response.
     */
    createVisit(resource){
        return this.#visitsEndpoint.create(resource);
    }


    createDiagnostic(resource){
        return this.#diagnosticEndpoint.create(resource);
    }

    createExpectedVisit(resource){
        return this.#expectedEndpoint.create(resource);
    }
    /**
     * Updates an existing visit.
     * @param {Object} resource - The visit data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated visit response.
     */
    updateVisit(id, resource) {
        return this.#visitsEndpoint.update(id, resource);
    }

    updateExpectedVisit(id, resource){
        return this.#expectedEndpoint.update(id,resource);
    }
    updateDiagnostic(id,resource){
        return this.#diagnosticEndpoint.update(id, resource);
    }
    /**
     * Deletes a visit by its ID.
     * @param {number|string} id - The ID of the category to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteVisit(id){
        return this.#visitsEndpoint.delete(id);
    }

    deleteExpectedVisit(id){
        return this.#expectedEndpoint.delete(id);
    }
    deleteDiagnostic(id){
        return this.#expectedEndpoint.delete(id);
    }
}