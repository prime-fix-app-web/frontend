import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";


const visitsEndpointPath = import.meta.env.VITE_VISITS_ENDPOINT_PATH;
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH;
const autoRepairsEndpointPath = import.meta.env.VITE_AUTOREPAIRS_ENDPOINT_PATH;
const serviceEndpointPath = import.meta.env.VITE_SERVICES_ENDPOINT_PATH;

const visitsQueryParamKey = import.meta.env.VITE_VISIT_QUERY_PARAM_KEY;
const vehiclesQueryParamKey= import.meta.env.VITE_VEHICLE_QUERY_PARAM_KEY;
const autoRepairsQueryParamKey = import.meta.env.VITE_AUTOREPAIR_QUERY_PARAM_KEY;
const serviceQueryParamKey = import.meta.env.VITE_SERVICE_QUERY_PARAM_KEY;


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
    #serviceEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #autoRepairEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #vehiclesEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #visitsEndpoint;
    /**
     * Initializes endpoints for visits, auto repairs,vehicles and services.
     */
    constructor(){
        super();
        this.#visitsEndpoint = new BaseEndpoint(this,visitsEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey:visitsQueryParamKey,
        });
        this.#vehiclesEndpoint=new BaseEndpoint(this,vehiclesEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey:vehiclesQueryParamKey,
        });
        this.#autoRepairEndpoint=new BaseEndpoint(this,autoRepairsEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey:autoRepairsQueryParamKey,
        });
        this.#serviceEndpoint = new BaseEndpoint(this,serviceEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey:serviceQueryParamKey,
        });
    }

    /**
     * Fetches all Services.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the services response.
     */
    getServices(){
        return this.#serviceEndpoint.getAll();
    }

    /**
     * Fetches all auto repairs.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the auto repair response.
     */
    getAutoRepairs(){
        return this.#autoRepairEndpoint.getAll();
    }

    /**
     * Fetches all vehicles.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the vehicle response.
     */
    getVehicles(){
        return this.#vehiclesEndpoint.getAll();
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

    /**
     * Updates an existing visit.
     * @param {Object} resource - The visit data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated visit response.
     */
    updateVisit(resource){
        return this.#visitsEndpoint.update(resource);
    }
    /**
     * Deletes a visit by its ID.
     * @param {number|string} id - The ID of the category to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteVisit(id){
        return this.#visitsEndpoint.delete(id);
    }

}