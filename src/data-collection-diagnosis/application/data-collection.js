import {DataApi} from "@/data-collection-diagnosis/infrastructure/data-api.js";
import {defineStore} from "pinia";
import {computed,ref} from "vue";
import {VisitAssembler} from "@/data-collection-diagnosis/infrastructure/visit.assembler.js";
import {VehicleAssembler} from "@/data-collection-diagnosis/infrastructure/vehicle.assembler.js";
import {AutoRepairAssembler} from "@/data-collection-diagnosis/infrastructure/auto-repair.assembler.js";
import {ServiceAssembler} from "@/data-collection-diagnosis/infrastructure/service.assembler.js";

const dataApi = new DataApi();

const useDataCollection = defineStore('useDataCollection', ()=>{

    const visits = ref([]);
    const vehicles = ref([]);
    const services = ref([]);
    const autoRepairs = ref([]);

    const errors = ref([]);

    const visitsLoaded = ref(false);
    const vehiclesLoaded = ref(false);
    const servicesLoaded = ref(false);
    const autoRepairsLoaded = ref(false);

    const visitsCount = computed(() => {
        return visitsLoaded ? visits.value.length:0;
    })

    const vehiclesCount = computed(() => {
        return vehiclesLoaded ? vehiclesLoaded.value.length:0;
    })
    const autoRepairsCount = computed(() => {
        return autoRepairsLoaded ? autoRepairs.value.length:0;
    })
    const servicesCount = computed(() => {
        return servicesLoaded ? servicesLoaded.value.length:0;
    })

    function fetchVisit(){
        dataApi.getVisits().then(response =>{
            visits.value = VisitAssembler.toEntitiesFromResponse(response);
            visitsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function fetchServices(){
        dataApi.getServices().then(response =>{
            services.value=ServiceAssembler.toEntitiesFromResponse(response);
            servicesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function fetchAutoRepairs(){
        dataApi.getAutoRepairs().then(response =>{
            autoRepairs.value=AutoRepairAssembler.toEntitiesFromResponse(response);
            autoRepairsLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function fetchVehicles(){
        dataApi.getVehicles().then(response =>{
            vehicles.value=VehicleAssembler.toEntitiesFromResponse(response);
            vehiclesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function getVisitsById(id){
        return visits.value.find((visit) => visit.id_visit === id);
    }
    function addVisit(visit){
        dataApi.createVisit(visit).then(response =>{
            const resource = response.data;
            const newVisit = VisitAssembler.toEntityFromResource(resource);
            visits.value.push(newVisit);
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function updateVisit(visit){
        dataApi.updateVisit(visit).then(response =>{
            const resource = response.data;
            const updateVisit = VisitAssembler.toEntityFromResource(resource);
            const index = visits.value.findIndex((visit) => visit.id_visit === updateVisit.id_visit);
            if(index!==-1) visits.value[index] = updateVisit;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function deleteVisit(id_visit){
        if (!id_visit) return;
        dataApi.deleteVisit(id_visit)
            .then(() => {
                const index = visits.value.findIndex(v => v.id_visit === id_visit);
                if (index !== -1) visits.value.splice(index, 1);
            })
            .catch(error => errors.value.push(error));
    }



    function getServicesById(id){
        return services.value.find((services) => services.id_service === id);
    }

    function getAutoRepairsById(id){
        return autoRepairs.value.find((autoRepair) => autoRepair.id_auto_repair === id);
    }

    function getVehiclesById(id){
        return vehicles.value.find((vehicles) => vehicles.id_vehicle === id);
    }

    return {
        visits,
        vehicles,
        services,
        autoRepairs,
        errors,
        visitsLoaded,
        vehiclesLoaded,
        servicesLoaded,
        autoRepairsLoaded,
        visitsCount,
        vehiclesCount,
        servicesCount,
        autoRepairsCount,
        fetchVisit,
        fetchServices,
        fetchAutoRepairs,
        fetchVehicles,
        addVisit,
        updateVisit,
        deleteVisit,
        getVisitsById,
        getServicesById,
        getAutoRepairsById,
        getVehiclesById

    };
})

export default useDataCollection;