import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { CatalogApi } from '@/auto-repair-catalog/infrastructure/catalog-api.js'
import { AutoRepairAssembler } from '@/auto-repair-catalog/infrastructure/auto-repair.assembler.js'
import {LocationAssembler} from "@/auto-repair-catalog/infrastructure/location.assembler.js";
import { apiConfig } from '@/shared/infrastructure/http/api-config.js';
import {ServiceAssembler} from "@/auto-repair-catalog/infrastructure/service.assembler.js";
import {ServiceOfferAssembler} from "@/auto-repair-catalog/infrastructure/service-offer.assembler.js";

/**
 * Check if there is an active JWT token in storage
 * @returns {boolean}
 */
function hasActiveJWT() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
}

const catalogApi = new CatalogApi()

const useCatalogStore = defineStore('auto-repair-catalog', () => {

  const autoRepairs = ref([]);
  const locations = ref([]);
  const serviceOffers = ref([]);
  const services = ref([]);

  const loading = ref(false)
  const errors = ref([])

  const autoRepairsLoaded = ref(false);
  const locationsLoaded = ref(false);
  const serviceOfferLoaded = ref(false);
  const servicesLoaded = ref(false);

  const autoRepairsCount = computed(()=>{
      return autoRepairsLoaded ? autoRepairs.value.length : 0;
  })

    const serviceCount = computed(()=>{
        return serviceOfferLoaded ? serviceOffers.value.length :0;
    })

  const locationsCount = computed(()=>{
      return locationsLoaded ? locations.value.length : 0;
  })

    async function fetchAutoRepairs(){
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[Catalog Store] Skipping fetchAutoRepairs - No JWT token available');
            return Promise.resolve();
        }

        return catalogApi.getAutoRepairs().then(response =>{
            autoRepairs.value = AutoRepairAssembler.toEntitiesFromResponse(response);
            autoRepairsLoaded.value = true;
        }).catch(error=>{
            console.error('[Catalog Store] fetchAutoRepairs error:', error);
            errors.value.push(error);
        });
    }

    async function fetchLocations(){
      // Si estamos usando AWS y no hay JWT, no hacer fetch
      if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
          console.log('[Catalog Store] Skipping fetchLocations - No JWT token available');
          return Promise.resolve();
      }

      return catalogApi.getLocations().then(response =>{
            locations.value = LocationAssembler.toEntitiesFromResponse(response);
            locationsLoaded.value = true;
      }).catch(error=>{
          console.error('[Catalog Store] fetchLocations error:', error);
          errors.value.push(error);
      });
  }

    async function fetchServices(){
      if(apiConfig.isAwsPrimary && !hasActiveJWT()){
          console.log('[Catalog Store] Skipping fetchServices - No JWT toke available');
          return Promise.resolve();
      }

      return catalogApi.getServices().then(response =>{
            console.log('[Catalog Store] fetchServices response:', response);
            console.log('[Catalog Store] fetchServices response.data:', response.data);
            services.value=ServiceAssembler.toEntitiesFromResponse(response);
            console.log('[Catalog Store] services after assembler:', services.value);
            servicesLoaded.value = true;
        }).catch(error => {
            console.error('[Catalog Store] fetchServices error:', error);
            errors.value.push(error);
        })
    }

  const updateLocation = async(locationData) =>{
      loading.value = true;
      errors.value =[];
      try{
          const locationId = locationData.id;
          const response = await catalogApi.updateLocation(locationData);
          const index = locations.value.findIndex(l => l.id === locationId)
          if(index !==-1){
              locations.value[index] = LocationAssembler.toEntityFromResource(response.data);
          }
          loading.value = false;
          return response;
      } catch (error){
          errors.value.push(error);
          loading.value = false;
          throw error;
      }
  }

  const updateAutoRepair = async (id, autoRepairData)=>{
      loading.value = true;
      errors.value =[];
      try {
          const autoRepairId = Number(id);
          const response = await catalogApi.updateAutoRepair(autoRepairData);
          const index = autoRepairs.value.findIndex(v =>Number(v.id) === autoRepairId);

          if(index !== -1){
              autoRepairs.value[index] = AutoRepairAssembler.toEntityFromResource(response.data);
          }
          loading.value = false;
          return response;
      } catch (error){
          errors.value.push(error);
          loading.value = false;
          throw error;
      }
  }

  function addLocation(location) {
      catalogApi.createLocation(location).then(response =>{
          const resource = response.data;
          const newLocation = LocationAssembler.toEntityFromResource(resource);
          locations.value.push(newLocation);
      }).catch(error =>{
          errors.value.push(error);
      })
  }

  function addAutoRepair(autoRepair){
      catalogApi.createAutoRepair(autoRepair).then(response =>{
          const resource = response.data;
          const newAutoRepair = AutoRepairAssembler.toEntityFromResource(resource);
          autoRepairs.value.push(newAutoRepair);
      }).catch(error =>{
          errors.value.push(error);
      })
  }

  function getLocationById(id){
      return locations.value.find((location)=>location.id === id);
  }

  function getAutoRepairById(id){
      return autoRepairs.value.find((autoRepair)=>autoRepair.id === id);
  }

  function deleteAutoRepair(autoRepairId){
      if(!autoRepairId) return;
      catalogApi.deleteAutoRepair(autoRepairId).then(response =>{
          const index = autoRepairs.value.findIndex(v => v.id === autoRepairId);
          if(index !== -1) autoRepairs.value.splice(index, 1);
      }).catch(error =>{
          errors.value.push(error);
      })
  }

  function deleteLocation(locationId){
      if(!locationId) return;
      catalogApi.deleteLocation(locationId).then(response =>{
          const index = locations.value.findIndex(v => v.id === locationId);
          if(index !== -1) locations.value.splice(index, 1);
      }).catch(error =>{
          errors.value.push(error);
      })
  }

    function getServiceById(id){
        return services.value.find((visit) => visit.id === id);
    }

    async function addService(service) {
        try {
            const payload = {
                name: service.name,
                description: service.description
            };

            const response = await catalogApi.createService(payload);

            console.log('[Catalog Store] addService response:', response);
            console.log('[Catalog Store] response.data:', response.data);

            // Handle both AWS (single object) and Supabase (array) responses
            let resource = response.data;

            // If response is an array (Supabase), get the first element
            if (Array.isArray(resource)) {
                resource = resource[0];
            }

            console.log('[Catalog Store] resource after extraction:', resource);

            const newService = ServiceAssembler.toEntityFromResource(resource);

            console.log('[Catalog Store] newService created:', newService);

            services.value.push(newService);

            return newService;
        } catch (error) {
            console.error('[Catalog Store] addService error:', error);
            errors.value.push(error);
            throw error;
        }
    }
    async function deleteService(service_id) {
        if (!service_id) return;

        loading.value = true;
        errors.value = [];

        try {
            await catalogApi.deleteService(service_id);
            const index = services.value.findIndex(v => v.id === service_id);
            if (index !== -1) services.value.splice(index, 1);

            loading.value = false;
            return true;
        } catch (error) {
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    }

    function fetchServiceOffers(autoRepairId) {
        if (!autoRepairId) return;
        loading.value = true;
        serviceOfferLoaded.value = false;

        catalogApi.getServiceOffersByAutoRepairsId(autoRepairId)
            .then(response => {
                const offers = ServiceOfferAssembler.toEntityFromResource(response);
                serviceOffers.value = Array.isArray(offers) ? offers : [offers];
                serviceOfferLoaded.value = true;
                loading.value = false;
            })
            .catch(error => {
                errors.value.push(error);
                loading.value = false;
            });
    }

    async function addServiceOffer(autoRepairId, payload) {
        if (loading.value) return;
        loading.value = true;
        errors.value = [];

        try {
            const response = await catalogApi.addServiceOffer(autoRepairId, payload);
            const newOffer = ServiceOfferAssembler.toEntityFromResource(response);
            if (!Array.isArray(serviceOffers.value)) {
                serviceOffers.value = [];
            }
            const exists = serviceOffers.value.some(
                offer => offer.id === newOffer.id
            );
            if (!exists) {
                serviceOffers.value.push(newOffer);
            }
            serviceOffers.value.push(newOffer);
            loading.value = false;
            return newOffer;
        } catch (error) {
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    }

    function deleteServiceOffer(autoRepairId, serviceOfferId) {
        if (!autoRepairId || !serviceOfferId) return;
        catalogApi.deleteServiceOffer(autoRepairId, serviceOfferId).then(() => {
            const index = serviceOffers.value.findIndex(o => o.id === serviceOfferId);
            if (index !== -1) serviceOffers.value.splice(index, 1);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function getServiceOfferById(id) {
        return serviceOffers.value.find((offer) => offer.id === id);
    }

  return {
      catalogApi, // Export API instance for external use
      autoRepairs,
      locations,
      errors,
      loading,
      autoRepairsLoaded,
      locationsLoaded,
      autoRepairsCount,
      locationsCount,
      fetchLocations,
      fetchAutoRepairs,
      updateLocation,
      updateAutoRepair,
      addAutoRepair,
      addLocation,
      getAutoRepairById,
      getLocationById,
      deleteLocation,
      deleteAutoRepair,
      services,
      servicesLoaded,
      serviceCount,
      getServiceById,
      addService,
      deleteService,
      fetchServices,
      serviceOffers,
      serviceOfferLoaded,
      fetchServiceOffers,
      addServiceOffer,
      deleteServiceOffer,
      getServiceOfferById
  };
})

export default useCatalogStore;
