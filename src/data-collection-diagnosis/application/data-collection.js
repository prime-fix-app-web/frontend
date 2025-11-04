import {DataApi} from "@/data-collection-diagnosis/infrastructure/data-api.js";
import {defineStore} from "pinia";
import {computed,ref} from "vue";
import {VisitAssembler} from "@/data-collection-diagnosis/infrastructure/visit.assembler.js";
import {ServiceAssembler} from "@/data-collection-diagnosis/infrastructure/service.assembler.js";
import {DiagnosticAssembler} from "@/data-collection-diagnosis/infrastructure/diagnostic.assembler.js";
import {ExpectedVisitAssembler} from "@/data-collection-diagnosis/infrastructure/expected-visit.assembler.js";

const dataApi = new DataApi();

const useDataCollection = defineStore('useDataCollection', ()=>{

    const visits = ref([]);
    const services = ref([]);
    const expectedVisit = ref([]);
    const diagnostic = ref([]);

    const errors = ref([]);
    const loading = ref(false);

    const visitsLoaded = ref(false);
    const servicesLoaded = ref(false);
    const expectedLoaded = ref(false);
    const diagnosticLoaded = ref(false);

    const visitsCount = computed(() => {
        return visitsLoaded ? visits.value.length:0;
    })

    const servicesCount = computed(() => {
        return servicesLoaded ? servicesLoaded.value.length:0;
    })

    const expectedCount = computed(()=>{
        return expectedLoaded ? expectedLoaded.value.length:0;
    })

    const diagnosticCount = computed(()=>{
        return diagnosticCount ? diagnosticCount.value.length:0;
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
    function fetchDiagnostic(){
        dataApi.getDiagnostic().then(response =>{
            diagnostic.value = DiagnosticAssembler.toEntitiesFromResponse(response);
            diagnosticLoaded.value = true;
        }).catch(error=>{
            errors.value.push(error);
        })
    }
    function fetchExpected(){
        dataApi.getExpectedVisits().then(response =>{
            expectedVisit.value= ExpectedVisitAssembler.toEntitiesFromResponse(response);
            expectedLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        })
    }

    function getVisitsById(id){
        return visits.value.find((visit) => visit.id_visit === id);
    }
    function getServiceById(id){
        return services.value.find((visit) => visit.id_service === id);
    }
    function getExpectedById(id){
        return expectedVisit.value.find((expected)=>expected.id_expected_visit === id);
    }
    function getDiagnosticById(id){
        return diagnostic.value.find((diagnostic) => diagnostic.id_diagnostic === id);
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
    function addService(service){
        dataApi.createService(service).then(response =>{
            const resource= response.data;
            const newService= ServiceAssembler.toEntityFromResource(resource);
            services.value.push(newService);
        }).catch(error =>{
            errors.value.push(error);
        })
    }
    function addDiagnostic(diagnostic){
        dataApi.createDiagnostic(diagnostic).then(response =>{
            const resource = response.data;
            const newDiagnostic = DiagnosticAssembler.toEntityFromResource(resource);
            diagnostic.value.push(newDiagnostic);
        }).catch(error =>{
            errors.value.push(error);
        })
    }
    function addExpected(expected){
        dataApi.createExpectedVisit(expected).then(response =>{
            const resource = response.data;
            const newExpected = ExpectedVisitAssembler.toEntityFromResource(resource);
            expected.value.push(newExpected);
        }).catch(error=>{
            errors.value.push(error);
        })
    }

    const updateVisit = async (id, visitData) => {
        loading.value = true;
        errors.value = [];
        try {
            const visitId = Number(id);
            const response = await dataApi.updateVisit(visitId, visitData);
            const index = visits.value.findIndex(v => Number(v.id_visit) === visitId);
            if (index !== -1) {
                visits.value[index] = {
                    ...visits.value[index],
                    ...visitData,
                    id_visit: visitId
                };
            }
            loading.value = false;
            return response;
        } catch (error) {
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    };
    const updateService = async (id,serviceData) =>{
        loading.value = true;
        errors.value = [];
        try{
            const serviceId=Number(id);
            const response = await dataApi.updateService(serviceId, serviceData);
            const index = services.value.findIndex(v => Number(v.id_services) === serviceId);
            if(index !==1){
                services.value[index] ={
                    ...services.value[index],
                    ...serviceData,
                    id_service:serviceId
                }
            }
            loading.value = false;
            return response;
        }catch(error){
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    }
    const updateExpected = async (id,expectedData) =>{
        loading.value = true;
        errors.value = [];
        try{
            const expectedId = Number(id);
            const response = await dataApi.updateExpectedVisit(expectedId, expectedData);
            const index =expectedVisit.value.findIndex(v => Number(v.id_expected) === expectedId);
            if(index !== -1){
                expectedData.value[index] ={
                    ...expectedVisit.value[index],
                    ...expectedData,
                    id_expected:expectedId
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
    const updateDiagnostic = async(id,diagnosticData)=>{
        loading.value=true;
        errors.value = [];
        try{
            const diagnosticId=Number(id);
            const response = await dataApi.updateDiagnostic(diagnosticId, diagnosticData);
            const index = diagnostic.value.findIndex(v => Number(v.id_diagnostic)===diagnosticId);
            if(index !== -1){
                diagnosticData.value[index] ={
                    ...diagnostic.value[index],
                    ...diagnosticData,
                    id_diagnostic:diagnosticId
                };
            }
            loading.value = false;
            return response;
        }catch (error){
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
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
    function deleteService(id_service){
        if(!id_service) return;
        dataApi.deleteService(id_service)
            .then(()=>{
                const index = services.value.findIndex(v=>v.id_service === id_service);
                if (index !== -1) services.value.splice(index, 1);
            })
            .catch(error => errors.value.push(error));
    }

    function deleteExpectedVisit (id_expected){
        if(!id_expected) return;
        dataApi.deleteExpectedVisit(id_expected)
            .then(()=>{
                const index = expectedVisit.value.findIndex(v => v.id_expected === id_expected);
                if (index !== -1) expectedVisit.value.splice(index, 1);
            })
            .catch(error => errors.value.push(error));
    }

    function deleteDiagnostic(id_diagnostic){
        if(!id_diagnostic) return;
        dataApi.deleteDiagnostic(id_diagnostic)
            .then(()=>{
                const index = diagnostic.value.findIndex(v => v.id_diagnostic === id_diagnostic);
                if(index !==-1) diagnostic.value.splice(index, 1);
            })
            .catch(error => errors.value.push(error));
    }
    return {

    };
})

export default useDataCollection;