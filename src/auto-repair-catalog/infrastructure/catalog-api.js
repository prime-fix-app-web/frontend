import { BaseApi } from '@/shared/infrastructure/http/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/http/base-endpoint.js'

const autoRepairsEndpointPath = import.meta.env.VITE_AUTOREPAIRS_ENDPOINT_PATH;
const locationEndpointPath = import.meta.env.VITE_LOCATIONS_ENDPOINT_PATH;
const serviceOfferEndpointPath = import.meta.env.VITE_SERVICEOFFER_ENDPOINT_PATH;
const serviceEndpointPath = import.meta.env.VITE_SERVICES_ENDPOINT_PATH;


/**
 * Catalog API class to handle API operations for Auto Repairs and Locations.
 * Extends BaseApi and provides CRUD operations for auto repairs and locations.
 *
 * @class
 * @extends BaseApi
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
     * @type {BaseEndpoint}
     * @private
     */
    #serviceOfferEndpoint;

    /**
     * @type {BaseEndpoint}
     * @private
     */
    #serviceEndpoint;

    /**
     * Initializes endpoints for Auto Repairs and Locations
     */
    constructor() {
      super();
      this.#autoRepairsEndpoint = new BaseEndpoint(this, autoRepairsEndpointPath,{
          usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
      });
      this.#locationsEndpoint = new BaseEndpoint(this, locationEndpointPath,{
          usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
      });
      this.#serviceEndpoint = new BaseEndpoint(this, serviceEndpointPath,{
          usePathParams: import.meta.env.VITE_USE_PATH_PARAMS,
      });
      this.#serviceOfferEndpoint = new BaseEndpoint(this, serviceOfferEndpointPath,{
          usePathParams: import.meta.env.VITE_USE_PATH_PARAMS
      })
    }

    /**
     * Fetches all AutoRepairs
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created AutoRepair response.     */
    getAutoRepairs() {
      return this.#autoRepairsEndpoint.getAll();
    }

    /**
     * Fetches all Services.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the services response.
     */
    getServices(){
        return this.#serviceEndpoint.getAll();
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
     * Deletes an auto repair by its ID
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
      return this.#locationsEndpoint.update(location.id, location);
  }

    /**
     * Deletes a location by its ID
     * @param id - Thw ID of the location to delete
     * @returns {Promise<import('axios').AxiosReponse>} - A promise that resolves to the API response.
     */
    deleteLocation(id){
      return this.#locationsEndpoint.delete(id);
  }

    /**
     * Adds a new Service Offer to a specific Auto Repair center.
     * Uses BaseEndpoint.create()
     * @param {number|string} id - AutoRepair ID
     * @param {object} offer - Offer data
     */
    addServiceOffer(id, offer){
        return this.#serviceOfferEndpoint.create({
            ...offer,
            auto_repair_id: id
        });
    }

    /**
     * Fetches all Service Offers associated with a specific Auto Repair center ID.
     * Uses BaseEndpoint.getAll() and relies on endpointPath filter.
     * @param {number|string} autoRepairId
     */
    getServiceOffersByAutoRepairsId(autoRepairId){
        const filter = `?auto_repair_id=eq.${autoRepairId}&select=*`;
        return this.http.get(`${serviceOfferEndpointPath}${filter}`);
    }

    /**
     * Deletes a specific Service Offer from an Auto Repair center.
     * Uses BaseEndpoint.delete()
     * @param {number|string} autoRepairId
     * @param {number|string} serviceOfferId
     */
    deleteServiceOffer(autoRepairId, serviceOfferId) {
        return this.#serviceOfferEndpoint.delete(serviceOfferId);
    }

    deleteService(id){
        return this.#serviceEndpoint.delete(id);
    }

    createService(resource){
        return this.#serviceEndpoint.create(resource);
    }

    updateService(id,resource){
        return this.#serviceEndpoint.update(id, resource);
    }

}
