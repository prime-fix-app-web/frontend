import { BaseApi } from '@/shared/infrastructure/http/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/http/base-endpoint.js'

const autoRepairsEndpointPath = import.meta.env.VITE_AUTOREPAIRS_ENDPOINT_PATH;
const locationEndpointPath = import.meta.env.VITE_LOCATIONS_ENDPOINT_PATH;

const autoRepairsQueryParamKey = import.meta.env.VITE_AUTOREPAIR_QUERY_PARAM_KEY;
const locationsQueryParamKey = import.meta.env.VITE_LOCATION_QUERY_PARAM_KEY;


/**
 * Catalog class to handle API operations for Catalog manipulation and recollection context.
 * Extends BaseApi and provides CRUD operations for categories and tutorials
 *
 * @class
 * @extends BaseApi
 * @example
 * const dataApi = new CatalogApi();
 */
export class CatalogApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #autoRepairsEndpoint;
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #locationsEndpoint;

    /**
     * Initializes endpoints for Auto Repairs and Locations
     */
    constructor() {
      super();
      this.#autoRepairsEndpoint = new BaseEndpoint(this, autoRepairsEndpointPath,{
          usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
          idQueryParamKey: autoRepairsQueryParamKey
      });
      this.#locationsEndpoint = new BaseEndpoint(this, locationEndpointPath,{
          usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
          idQueryParamKey: locationsQueryParamKey
      })
    }

    /**
     * Fetches all AutoRepairs
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created AutoRepair response.     */
    getAutoRepairs() {
      return this.#autoRepairsEndpoint.getAll();
  }

    /**
     * Fetches a auto repair by its ID
     * @param id - The ID of the AutoRepair to fetch
     * @returns {Promise<import('axios').AxiosReponse>} A promise that resolves to the API response.
     */
    getAutoRepairById(id){
      return this.#autoRepairsEndpoint.getById(id);
  }

    /**
     * Creates a new AutoRepair
     * @param repair - The autoRepair resource to create
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    createAutoRepair(repair){
      return this.#autoRepairsEndpoint.create(repair);
  }

    /**
     * Updates an existing auto repair
     * @param repair - The autoRepair resource to update
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    updateAutoRepair(repair){
      return this.#autoRepairsEndpoint.update(repair.id, repair);
  }

    /**
     * Deletes a auto repair by its ID
     * @param id - The ID of the autoRepair to delete
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    deleteAutoRepair(id){
      return this.#autoRepairsEndpoint.delete(id);
  }

    /**
     * Fetches all Locations
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created Locations response.
     */
    getLocations(){
      return this.#locationsEndpoint.getAll();
  }

    /**
     * Fetches a Location by its ID
     * @param id - Thw ID of the Locations to fetch
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    getLocationById(id){
      return this.#locationsEndpoint.getById(id);
  }

    /**
     * Creates a new Location
     * @param location - The location resource to create
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    createLocation(location){
      return this.#locationsEndpoint.create(location);
  }

    /**
     * Updates an existing location.
     * @param location - The location resource to update
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    updateLocation(location){
      return this.#locationsEndpoint.update(location.id_location, location);
  }

    /**
     * Deletes a location by its ID
     * @param id - Thw ID of the location to delete
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    deleteLocation(id){
      return this.#locationsEndpoint.delete(id);
  }

}
