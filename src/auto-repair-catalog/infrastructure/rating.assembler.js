import { Rating } from '@/auto-repair-catalog/domain/model/rating.entity.js'

export class RatingAssembler {
  static toEntityFromResource(resource) {
    return new Rating({ ...resource })
  }
  static toEntitiesFromResponse(response) {
    if (response.status !== 200) {
      console.error(`${response.status}, ${response.statusText}`)
      return []
    }
    const resources = Array.isArray(response.data) ? response.data : response.data['ratings']
    return resources.map(r => this.toEntityFromResource(r))
  }
}
