import { BaseApi } from '@/shared/infrastructure/http/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/http/base-endpoint.js'

// Fallback a la ruta del mock server si no está definida la variable
const autoRepairsEndpointPath = import.meta.env.VITE_AUTO_REPAIRS_ENDPOINT_PATH || '/api/v1/auto_repairs'
const ratingsEndpointPath = import.meta.env.VITE_RATINGS_ENDPOINT_PATH || '/api/v1/ratings'
const vehiclesEndpointPath = import.meta.env.VITE_VEHICLES_ENDPOINT_PATH || '/api/v1/vehicles'
const visitsEndpointPath = import.meta.env.VITE_VISITS_ENDPOINT_PATH || '/api/v1/visits'

export class OwnerApi extends BaseApi {
  #autoRepairsEndpoint
  #ratingsEndpoint
  #vehiclesEndpoint
  #visitsEndpoint
  constructor() {
    super()
    this.#autoRepairsEndpoint = new BaseEndpoint(this, autoRepairsEndpointPath)
    this.#ratingsEndpoint = new BaseEndpoint(this, ratingsEndpointPath)
    this.#vehiclesEndpoint = new BaseEndpoint(this, vehiclesEndpointPath)
    this.#visitsEndpoint = new BaseEndpoint(this, visitsEndpointPath)
  }
  getAutoRepairs() { return this.#autoRepairsEndpoint.getAll() }
  getRatings() { return this.#ratingsEndpoint.getAll() }
  getVehicles() { return this.#vehiclesEndpoint.getAll() }
  getVisits() { return this.#visitsEndpoint.getAll() }
  createVisit(resource) { return this.#visitsEndpoint.create(resource) }
}
