import {DataApi} from "@/data-collection-diagnosis/infrastructure/data-api.js";
import {defineStore} from "pinia";
import {computed,ref} from "vue";
import {VisitAssembler} from "@/data-collection-diagnosis/infrastructure/visit.assembler.js";
import {DiagnosticAssembler} from "@/data-collection-diagnosis/infrastructure/diagnostic.assembler.js";
import {ExpectedVisitAssembler} from "@/data-collection-diagnosis/infrastructure/expected-visit.assembler.js";
import { apiConfig } from '@/shared/infrastructure/http/api-config.js';

/**
 * Check if there is an active JWT token in storage
 * @returns {boolean}
 */
function hasActiveJWT() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
}

const dataApi = new DataApi();

const useDataCollection = defineStore('useDataCollection', ()=>{

    const visits = ref([]);
    const expectedVisit = ref([]);
    const diagnostic = ref([]);

    const errors = ref([]);
    const loading = ref(false);

    const visitsLoaded = ref(false);
    const expectedLoaded = ref(false);
    const diagnosticLoaded = ref(false);

    const visitsCount = computed(() => {
        return visitsLoaded ? visits.value.length:0;
    })


    const expectedCount = computed(()=>{
        return expectedLoaded ? expectedLoaded.value.length:0;
    })

    const diagnosticCount = computed(()=>{
        return diagnosticCount ? diagnosticCount.value.length:0;
    })

    function fetchVisit(){
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[Data Collection Store] Skipping fetchVisit - No JWT token available');
            return Promise.resolve();
        }

        return dataApi.getVisits().then(response =>{
            visits.value = VisitAssembler.toEntitiesFromResponse(response);
            visitsLoaded.value = true;
        }).catch(error => {
            console.error('[Data Collection Store] fetchVisit error:', error);
            errors.value.push(error);
        });
    }


    function fetchDiagnostic(){
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[Data Collection Store] Skipping fetchDiagnostic - No JWT token available');
            return Promise.resolve();
        }

        return dataApi.getDiagnostic().then(response =>{
            diagnostic.value = DiagnosticAssembler.toEntitiesFromResponse(response);
            diagnosticLoaded.value = true;
        }).catch(error=>{
            console.error('[Data Collection Store] fetchDiagnostic error:', error);
            errors.value.push(error);
        });
    }

    function fetchExpected(){
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[Data Collection Store] Skipping fetchExpected - No JWT token available');
            return Promise.resolve();
        }

        return dataApi.getExpectedVisits().then(response =>{
            expectedVisit.value= ExpectedVisitAssembler.toEntitiesFromResponse(response);
            expectedLoaded.value = true;
        }).catch(error => {
            console.error('[Data Collection Store] fetchExpected error:', error);
            errors.value.push(error);
        });
    }

    function getVisitsById(id){
        return visits.value.find((visit) => visit.id === id);
    }
    function getExpectedById(id){
        return expectedVisit.value.find((expected)=>expected.id === id);
    }
    function getDiagnosticById(id){
        return diagnostic.value.find((diagnostic) => diagnostic.id === id);
    }

    function addVisit(visit){
        dataApi.createVisit(visit).then(response =>{
            const resource = response.data;
            const newVisit = VisitAssembler.toEntityFromResource(resource);
            visits.value.push(newVisit);
            return newVisit
        }).catch(error => {
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
            // Remove id from payload as it's in the URL path
            const { id: _, ...payload } = visitData;
            const response = await dataApi.updateVisit(visitId, payload);
            const index = visits.value.findIndex(v => Number(v.id) === visitId);
            if (index !== -1) {
                visits.value[index] = {
                    ...visits.value[index],
                    ...payload,
                    id: visitId
                };
            }
            loading.value = false;
            return response;
        } catch (error) {
            console.error('[Data Collection Store] updateVisit error:', error);
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    };

    const updateExpected = async (id, expectedData) => {
        loading.value = true;
        errors.value = [];
        try {
            const expectedId = Number(id);
            // Remove id from payload as it's in the URL path
            const { id: _, ...payload } = expectedData;
            const response = await dataApi.updateExpectedVisit(expectedId, payload);
            const index = expectedVisit.value.findIndex(v => Number(v.id) === expectedId);
            if (index !== -1) {
                expectedVisit.value[index] = {
                    ...expectedVisit.value[index],
                    ...payload,
                    id: expectedId
                };
            }
            loading.value = false;
            return response;
        } catch (error) {
            console.error('[Data Collection Store] updateExpected error:', error);
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    }

    const updateDiagnostic = async (id, diagnosticData) => {
        loading.value = true;
        errors.value = [];
        try {
            const diagnosticId = Number(id);
            // Remove id from payload as it's in the URL path
            const { id: _, ...payload } = diagnosticData;
            const response = await dataApi.updateDiagnostic(diagnosticId, payload);
            const index = diagnostic.value.findIndex(v => Number(v.id) === diagnosticId);
            if (index !== -1) {
                diagnostic.value[index] = {
                    ...diagnostic.value[index],
                    ...payload,
                    id: diagnosticId
                };
            }
            loading.value = false;
            return response;
        } catch (error) {
            console.error('[Data Collection Store] updateDiagnostic error:', error);
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    }

    function deleteVisit(id_visit){
        if (!id_visit) return;
        dataApi.deleteVisit(id_visit)
            .then(() => {
                const index = visits.value.findIndex(v => v.id === id_visit);
                if (index !== -1) visits.value.splice(index, 1);
            })
            .catch(error => errors.value.push(error));
    }


    function deleteExpectedVisit (expectedId){
        if(!expectedId) return;
        dataApi.deleteExpectedVisit(expectedId)
            .then(()=>{
                const index = expectedVisit.value.findIndex(v => v.id === expectedId);
                if (index !== -1) expectedVisit.value.splice(index, 1);
            })
            .catch(error => errors.value.push(error));
    }

    function deleteDiagnostic(diagnosticId){
        if(!diagnosticId) return;
        dataApi.deleteDiagnostic(diagnosticId)
            .then(()=>{
                const index = diagnostic.value.findIndex(v => v.id === diagnosticId);
                if(index !==-1) diagnostic.value.splice(index, 1);
            })
            .catch(error => errors.value.push(error));
    }
    return {
        visits,
        expectedVisit,
        diagnostic,
        errors,
        loading,
        visitsLoaded,
        expectedLoaded,
        diagnosticLoaded,
        visitsCount,
        expectedCount,
        diagnosticCount,
        fetchVisit,
        fetchExpected,
        fetchDiagnostic,
        getVisitsById,
        getExpectedById,
        getDiagnosticById,
        addDiagnostic,
        addVisit,
        addExpected,
        updateVisit,
        updateExpected,
        updateDiagnostic,
        deleteVisit,
        deleteDiagnostic,
        deleteExpectedVisit
    };
})

export default useDataCollection;