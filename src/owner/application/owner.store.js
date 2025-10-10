import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { OwnerApi } from '@/owner/infrastructure/owner-api.js'
import { AutoRepairAssembler } from '@/owner/infrastructure/auto-repair.assembler.js'
import useIamStore from '@/iam/application/iam.store.js'
import { RatingAssembler } from '@/owner/infrastructure/rating.assembler.js'
import { VehicleAssembler } from '@/owner/infrastructure/vehicle.assembler.js'

const ownerApi = new OwnerApi()

const useOwnerStore = defineStore('owner', () => {
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
      // json-server devuelve directamente el array, lo guardamos crudo
      visits.value = Array.isArray(resp.data) ? resp.data : (resp.data['visits'] || [])
    } catch (e) { console.error(e) }
  }

  // Map de promedios por id de taller
  const avgRatingMap = computed(() => {
    const map = new Map()
    if (!ratings.value.length) return map
    const grouped = ratings.value.reduce((acc, r) => {
      const key = r.autoRepairId
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
    const matchingLocationIds = (iam.locations || [])
      .filter(l => l.department === selectedDepartment.value && l.district === selectedDistrict.value)
      .map(l => l.id)
    return autoRepairs.value.filter(ar => matchingLocationIds.includes(ar.locationId))
  })

  function ensureLookupsLoaded() {
    if (!iam.locationsLoaded) iam.fetchLocations()
  }

  function preselectDefaults() {
    if (departments.value.includes('Lima')) selectedDepartment.value = 'Lima'
    if (!selectedDepartment.value && departments.value.length) selectedDepartment.value = departments.value[0]
    if (selectedDepartment.value && districts.value.length) {
      selectedDistrict.value = districts.value.includes('San Miguel') ? 'San Miguel' : districts.value[0]
    }
  }

  function getLocationInfo(locationId) {
    const loc = iam.getLocationById(locationId)
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
      // id_service no lo manejamos en este flujo
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
