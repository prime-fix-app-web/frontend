import { AutoRepair } from '@/owner/domain/model/auto-repair.entity.js'

export class AutoRepairAssembler {
  static toEntityFromResource(resource) {
    const flat = { ...resource }
    // Normaliza identificador principal
    if (!flat.id_auto_repair && typeof flat.id === 'string') {
      // dejamos ambos por compatibilidad con el constructor
      flat.id = flat.id
    }
    // Aplana location anidada si viene como objeto
    if (flat.location && typeof flat.location === 'object') {
      const loc = flat.location
      if (!flat.id_location && typeof loc.id_location === 'string') flat.id_location = loc.id_location
      if (!flat.location_id && (loc.id || loc.pk)) flat.location_id = String(loc.id ?? loc.pk)
    }
    // Mapea camelCase alternativos
    if (flat.locationId && !flat.id_location) flat.id_location = String(flat.locationId)
    if (flat.locationPk && !flat.location_id) flat.location_id = String(flat.locationPk)

    return new AutoRepair(flat)
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
