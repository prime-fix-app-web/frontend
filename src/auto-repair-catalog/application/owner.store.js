import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { CatalogApi } from '@/auto-repair-catalog/infrastructure/catalog-api.js'
import { AutoRepairAssembler } from '@/auto-repair-catalog/infrastructure/auto-repair.assembler.js'
import {LocationAssembler} from "@/auto-repair-catalog/infrastructure/location.assembler.js";

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
      catalogApi.getAutoRepairs().then(response =>{
          autoRepairs.value = AutoRepairAssembler.toEntitiesFromResponse(response);
          autoRepairsLoaded.value = true;
      }).catch(error=>{
          errors.value.push(error);
      })
  }

  function fetchLocations(){
      catalogApi.getLocations().then(response =>{
            locations.value = LocationAssembler.toEntitiesFromResponse(response);
            locationsLoaded.value = true;
      }).catch(error=>{
          errors.value.push(error);
      })
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
  };
})

export default useCatalogStore;
