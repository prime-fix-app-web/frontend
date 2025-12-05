import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { CatalogApi } from '@/auto-repair-catalog/infrastructure/catalog-api.js'
import { AutoRepairAssembler } from '@/auto-repair-catalog/infrastructure/auto-repair.assembler.js'
import {LocationAssembler} from "@/auto-repair-catalog/infrastructure/location.assembler.js";
import { apiConfig } from '@/shared/infrastructure/http/api-config.js';

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

  const loading = ref(false)
  const errors = ref([])

  const autoRepairsLoaded = ref(false);
  const locationsLoaded = ref(false);

  const autoRepairsCount = computed(()=>{
      return autoRepairsLoaded ? autoRepairs.value.length : 0;
  })

  const locationsCount = computed(()=>{
      return locationsLoaded ? locations.value.length : 0;
  })

    function fetchAutoRepairs(){
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

  function fetchLocations(){
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

  const updateLocation = async(id,locationData) =>{
      loading.value = true;
      errors.value =[];
      try{
          const locationId = Number(id);
          const response = await catalogApi.updateLocation(locationId, locationData);
          const index = locations.value.findIndex(v =>Number(v.id_location) === locationId)
          if(index !==-1){
              locations.value[index] ={
                  ...locations.value[index],
                  ...locationData,
                  id_location: locationId
              };
          }
          loading.value = false;
          return response;
      } catch (error){
          errors.value.push(error);
          loading.value = false;
          throw error;
      }
  }

  const updateAutoRepair = async (id,autoRepairData)=>{
      loading.value = true;
      errors.value =[];
      try {
          const autoRepairId = Number(id);
          const response = await catalogApi.updateAutoRepair(autoRepairId, autoRepairData);
          const index = autoRepairs.value.findIndex(v =>Number(v.id_auto_repair) === autoRepairId);

          if(index !== -1){
              autoRepairs.value[index] = {
                  ...autoRepairs.value[index],
                  ...autoRepairData,
                  id_auto_repair: autoRepairId
              };
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
      return locations.value.find((location)=>location.id_location === id);
  }

  function getAutoRepairById(id){
      return autoRepairs.value.find((autoRepair)=>autoRepair.id_auto_repair === id);
  }

  function deleteAutoRepair(id_auto_repair){
      if(!id_auto_repair) return;
      catalogApi.deleteAutoRepair(id_auto_repair).then(response =>{
          const index = autoRepairs.value.findIndex(v => v.id_auto_repair === id_auto_repair);
          if(index !== -1) autoRepairs.value.splice(index, 1);
      }).catch(error =>{
          errors.value.push(error);
      })
  }

  function deleteLocation(id_location){
      if(!id_location) return;
      catalogApi.deleteLocation(id_location).then(response =>{
          const index = locations.value.findIndex(v => v.id_location === id_location);
          if(index !== -1) locations.value.splice(index, 1);
      }).catch(error =>{
          errors.value.push(error);
      })
  }

  return {
      autoRepairs,
      locations,
      errors,
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
      deleteAutoRepair
  };
})

export default useCatalogStore;
