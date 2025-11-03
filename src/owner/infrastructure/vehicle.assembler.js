import { Vehicle } from '@/owner/domain/model/vehicle.entity.js'

export class VehicleAssembler {
  static toEntityFromResource(resource) {
    return new Vehicle({ ...resource })
  }
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = Array.isArray(response.data) ? response.data : response.data['vehicles']
    return resources.map(r => this.toEntityFromResource(r))
  }
}
