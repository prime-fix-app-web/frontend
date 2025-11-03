import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { OwnerApi } from '@/auto-repair-catalog/infrastructure/owner-api.js'
import { AutoRepairAssembler } from '@/auto-repair-catalog/infrastructure/auto-repair.assembler.js'
import useIamStore from '@/iam/application/iam.store.js'
import { RatingAssembler } from '@/auto-repair-catalog/infrastructure/rating.assembler.js'
import { VehicleAssembler } from '@/auto-repair-catalog/infrastructure/vehicle.assembler.js'

const ownerApi = new OwnerApi()

const useOwnerStore = defineStore('auto-repair-catalog', () => {
  const iam = useIamStore()

  const autoRepairs = ref([])
  const ratings = ref([])
  const vehicles = ref([])
  const visits = ref([])
  const loading = ref(false)
  const error = ref(null)

  const selectedDepartment = ref('')
  const selectedDistrict = ref('')

  const departments = computed(() => {
    const set = new Set((iam.locations || []).map(l => l.department))
    return Array.from(set)
  })
  const districts = computed(() => {
    if (!selectedDepartment.value) return []
    const set = new Set((iam.locations || []).filter(l => l.department === selectedDepartment.value).map(l => l.district))
    return Array.from(set)
  })

  const fetchAutoRepairs = async () => {
    loading.value = true
    error.value = null
    try {
      const resp = await ownerApi.getAutoRepairs()
      autoRepairs.value = AutoRepairAssembler.toEntitiesFromResponse(resp)
    } catch (e) {
      error.value = e
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const fetchRatings = async () => {
    try {
      const resp = await ownerApi.getRatings()
      ratings.value = RatingAssembler.toEntitiesFromResponse(resp)
    } catch (e) {
      console.error(e)
    }
  }

  const fetchVehicles = async () => {
    try {
      const resp = await ownerApi.getVehicles()
      vehicles.value = VehicleAssembler.toEntitiesFromResponse(resp)
    } catch (e) { console.error(e) }
  }
  const fetchVisits = async () => {
    try {
      const resp = await ownerApi.getVisits()
      // json-server returns arrays directly; keep as-is
      visits.value = Array.isArray(resp.data) ? resp.data : (resp.data['visits'] || [])
    } catch (e) { console.error(e) }
  }

  // Average stars grouped by workshop id
  const avgRatingMap = computed(() => {
    const map = new Map()
    if (!ratings.value.length) return map
    const grouped = ratings.value.reduce((acc, r) => {
      // primary key to group by: prefer explicit relation; fallback to own id
      const key = r.autoRepairId || r.id
      if (!key) return acc
      if (!acc[key]) acc[key] = []
      acc[key].push(r.stars)
      return acc
    }, {})
    for (const [k, arr] of Object.entries(grouped)) {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length
      map.set(k, avg)
    }
    return map
  })

  const filteredAutoRepairs = computed(() => {
    if (!selectedDepartment.value || !selectedDistrict.value) return []
    const depN = String(selectedDepartment.value).trim().toLowerCase()
    const distN = String(selectedDistrict.value).trim().toLowerCase()
    const locs = (iam.locations || []).filter(l =>
      String(l.department || '').trim().toLowerCase() === depN &&
      String(l.district || '').trim().toLowerCase() === distN
    )
    const codeIds = new Set(locs.map(l => String(l.id || '').trim()).filter(Boolean))
    const pkIds = new Set(locs.map(l => String(l.pk || '').trim()).filter(Boolean))
    // Fallback: some backends share the same id between auto_repairs and locations
    const sharedIds = new Set([
      ...codeIds,
      ...pkIds,
    ])
    if (codeIds.size === 0 && pkIds.size === 0) return []
    return autoRepairs.value.filter(ar => {
      const lid = String(ar.locationId || '').trim()
      const lpk = String(ar.locationPk || '').trim()
      const aid = String(ar.id || '').trim()
      return (lid && codeIds.has(lid)) || (lpk && pkIds.has(lpk)) || (aid && sharedIds.has(aid))
    })
  })

  function ensureLookupsLoaded() {
    if (!iam.locationsLoaded) iam.fetchLocations()
  }

  function preselectDefaults() {
    if (departments.value.map(d => d.toLowerCase()).includes('lima')) selectedDepartment.value = 'Lima'
    if (!selectedDepartment.value && departments.value.length) selectedDepartment.value = departments.value[0]
    if (selectedDepartment.value && districts.value.length) {
      const hasSanMiguel = districts.value.some(d => String(d).toLowerCase() === 'san miguel')
      selectedDistrict.value = hasSanMiguel ? districts.value.find(d => String(d).toLowerCase() === 'san miguel') : districts.value[0]
    }
  }

  function getLocationInfo(locationIdOrPk) {
    const key = String(locationIdOrPk)
    const locs = iam.locations || []
    let loc = locs.find(l => String(l.id) === key)
    if (!loc) loc = locs.find(l => String(l.pk) === key)
    if (!loc) return null
    return { address: loc.address, district: loc.district, department: loc.department }
  }

  function getAverageRating(autoRepairId) {
    return avgRatingMap.value.get(autoRepairId) || 0
  }

  const myVehicles = computed(() => {
    const uid = iam.sessionUser?.id
    return vehicles.value.filter(v => v.userId === uid)
  })

  const visitsByVehicle = (vehicleId) => visits.value.filter(v => v.id_vehicle === vehicleId)

  async function requestVisit({ autoRepairId, vehicleId, failure, timeVisit }) {
    const payload = {
      failure,
      time_visit: timeVisit,
      id_auto_repair: autoRepairId,
      // id_service is not part of this flow
      status: 'En espera',
      id_vehicle: vehicleId,
    }
    const resp = await ownerApi.createVisit(payload)
    const created = resp.data
    visits.value.push(created)
    return created
  }

  // Keep selectedDistrict consistent when department changes
  watch(selectedDepartment, () => {
    if (!districts.value.includes(selectedDistrict.value)) {
      selectedDistrict.value = districts.value[0] || ''
    }
  })

  return {
    // state
    autoRepairs, ratings, loading, error,
    selectedDepartment, selectedDistrict,
    vehicles, visits, myVehicles,
    // lookups
    departments, districts,
    // actions
    fetchAutoRepairs, fetchRatings, fetchVehicles, fetchVisits, ensureLookupsLoaded, preselectDefaults,
    // getters
    filteredAutoRepairs,
    // location info
    getLocationInfo,
    // ratings
    getAverageRating,
    // visits
    visitsByVehicle, requestVisit,
  }
})

export default useOwnerStore
