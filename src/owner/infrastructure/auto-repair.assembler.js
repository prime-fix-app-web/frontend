import { AutoRepair } from '@/owner/domain/model/auto-repair.entity.js'

export class AutoRepairAssembler {
  static toEntityFromResource(resource) {
    return new AutoRepair({ ...resource })
  }
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = Array.isArray(response.data) ? response.data : response.data['auto_repairs']
    return resources.map(r => this.toEntityFromResource(r))
  }
}

