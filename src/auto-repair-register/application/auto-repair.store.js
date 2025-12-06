import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {TechnicianAssembler} from "@/auto-repair-register/infrastructure/technician.assembler.js";
import {TechnicianScheduleAssembler} from "@/auto-repair-register/infrastructure/technician-schedule.assembler.js";
import {AutoRepairRegisterApi} from "@/auto-repair-register/infrastructure/auto-repair-api.js";
import { apiConfig } from '@/shared/infrastructure/http/api-config.js';

/**
 * Check if there is an active JWT token in storage
 * @returns {boolean}
 */
function hasActiveJWT() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return !!token;
}

const autoRepairApi = new AutoRepairRegisterApi();

export const useAutoRepairRegisterStore = defineStore('autoRepairRegister', () => {

    const technicians = ref([]);
    const techniciansSchedule = ref([]);

    const errors = ref([]);
    const loading = ref(false);

    const techniciansLoaded = ref(false);
    const techniciansScheduleLoaded = ref(false);

    const techniciansCount = computed(() => {
        return techniciansLoaded.value ? technicians.value.length : 0;
    });
    const techniciansScheduleCount = computed(()=>{
        return techniciansScheduleLoaded.value ? techniciansSchedule.value.length : 0;
    });

    function fetchTechnicians(){
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[AutoRepair Register Store] Skipping fetchTechnicians - No JWT token available');
            return Promise.resolve();
        }

        return autoRepairApi.getTechnicians().then(response =>{
            technicians.value = TechnicianAssembler.toEntitiesFromResponse(response);
            techniciansLoaded.value = true;
        }).catch(error =>{
            console.error('[AutoRepair Register Store] fetchTechnicians error:', error);
            errors.value.push(error);
        });
    }

    function fetchTechnicianSchedule(){
        // Si estamos usando AWS y no hay JWT, no hacer fetch
        if (apiConfig.isAwsPrimary && !hasActiveJWT()) {
            console.log('[AutoRepair Register Store] Skipping fetchTechnicianSchedule - No JWT token available');
            return Promise.resolve();
        }

        return autoRepairApi.getTechnicianSchedule().then(response =>{
            techniciansSchedule.value = TechnicianScheduleAssembler.toEntitiesFromResponse(response);
            techniciansScheduleLoaded.value = true;
        }).catch(error =>{
            console.error('[AutoRepair Register Store] fetchTechnicianSchedule error:', error);
            errors.value.push(error);
        });
    }

    const updateTechnician = async (id,technicianData)=>{
        loading.value = true;
        errors.value = [];
        try{
            const technicianId =Number(id);
            const response = await autoRepairApi.updateTechnician(technicianId,technicianData);
            const index = technicians.value.findIndex(v => Number(v.id)===technicianId);
            if(index !==-1){
                technicians.value[index]={
                    ...technicians.value[index],
                    ...technicianData,
                    id: technicianId
                };
            }
            loading.value = false;
            return response
        } catch (error){
            errors.value.push(error);
            loading.value = false;
            throw error;
        }
    };
    const updateTechnicianSchedule = async (id, scheduleData) =>{
        loading.value = true;
        errors.value = [];
        try {
            const scheduleId = Number(id);
            const response = await autoRepairApi.updateTechnicianSchedule(scheduleId,scheduleData);
            const index = techniciansSchedule.value.findIndex(v => Number(v.id)===scheduleId);
            if(index !==-1){
                techniciansSchedule.value[index]={
                    ...techniciansSchedule.value[index],
                    ...scheduleData,
                    id: scheduleId
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

    function addTechnician(technician){
        const resource = TechnicianAssembler.toResourceFromEntity(technician);
        return autoRepairApi.createTechnician(resource).then(response =>{
            // Handle both AWS (single object) and Supabase (array) responses
            let responseData = response.data;

            // If response is an array (Supabase), get the first element
            if (Array.isArray(responseData)) {
                responseData = responseData[0];
            }

            const newTechnician = TechnicianAssembler.toEntityFromResource(responseData);
            technicians.value.push(newTechnician);

            // Retornar el técnico creado con el ID real del backend
            return newTechnician;
        }).catch(error =>{
            console.error('[AutoRepair Register Store] addTechnician error:', error);
            errors.value.push(error);
            throw error; // Re-lanzar el error para que el componente lo maneje
        })
    }
    function addTechnicianSchedule(schedule){
        const resource = TechnicianScheduleAssembler.toResourceFromEntity(schedule);
        autoRepairApi.createTechnicianSchedule(resource).then(response =>{
            // Handle both AWS (single object) and Supabase (array) responses
            let responseData = response.data;

            // If response is an array (Supabase), get the first element
            if (Array.isArray(responseData)) {
                responseData = responseData[0];
            }

            const newSchedule = TechnicianScheduleAssembler.toEntityFromResource(responseData);
            techniciansSchedule.value.push(newSchedule);
        }).catch(error =>{
            console.error('[AutoRepair Register Store] addTechnicianSchedule error:', error);
            errors.value.push(error);
        })
    }

    function deleteTechnician(technicianId){
        if(!technicianId) return;
        autoRepairApi.deleteTechnician(technicianId)
            .then(()=>{
                const index = technicians.value.findIndex(v => v.id === technicianId);
                if(index !== -1) technicians.value.splice(index, 1);
            }).catch(error =>{
                errors.value.push(error);
        })

    }
    function deleteTechnicianSchedule(scheduleId){
        if(!scheduleId) return;
        autoRepairApi.deleteTechnicianSchedule(scheduleId).then(()=>{
            const index = techniciansSchedule.value.findIndex(v=> v.id === scheduleId);
            if(index !== -1) technicians.value.splice(index, 1);
        }).catch(error =>{
            errors.value.push(error);
        })
    }

    function getTechnicianById(technicianId){
        return technicians.value.find(v => v.id === technicianId);
    }



    function clearErrors() {
        errors.value = [];
    }
    return {
        technicians,
        techniciansSchedule,
        errors,
        loading,
        techniciansLoaded,
        techniciansScheduleLoaded,
        techniciansCount,
        techniciansScheduleCount,
        fetchTechnicians,
        fetchTechnicianSchedule,
        addTechnician,
        addTechnicianSchedule,
        updateTechnician,
        updateTechnicianSchedule,
        deleteTechnician,
        deleteTechnicianSchedule,
        getTechnicianById
    };
});

export default useAutoRepairRegisterStore;