import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {TechnicianAssembler} from "@/auto-repair-register/infrastructure/technician.assembler.js";
import {TechnicianScheduleAssembler} from "@/auto-repair-register/infrastructure/technician-schedule.assembler.js";
import {AutoRepairRegisterApi} from "@/auto-repair-register/infrastructure/auto-repair-api.js";

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
        autoRepairApi.getTechnicians().then(response =>{
            technicians.value = TechnicianAssembler.toEntitiesFromResponse(response);
            techniciansLoaded.value = false;
        }).catch(error =>{
            errors.value.push(error);
        })
    }
    function fetchTechnicianSchedule(){
        autoRepairApi.getTechnicianSchedule().then(response =>{
            techniciansSchedule.value = TechnicianScheduleAssembler.toEntitiesFromResponse(response);
            techniciansScheduleLoaded.value = false;
        }).catch(error =>{
            errors.value.push(error);
        })
    }

    const updateTechnician = async (id,technicianData)=>{
        loading.value = true;
        errors.value = [];
        try{
            const technicianId =Number(id);
            const response = await autoRepairApi.updateTechnician(technicianId,technicianData);
            const index = technicians.value.findIndex(v => Number(v.id_technician)===technicianId);
            if(index !==-1){
                technicians.value[index]={
                    ...technicians.value[index],
                    ...technicianData,
                    id_technician: technicianId
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
            const index = techniciansSchedule.value.findIndex(v => Number(v.id_technician_schedule)===scheduleId);
            if(index !==-1){
                techniciansSchedule.value[index]={
                    ...techniciansSchedule.value[index],
                    ...scheduleData,
                    id_schedule: scheduleId
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
        autoRepairApi.createTechnician(technician).then(response =>{
            const resource = response.data;
            const newTechnician = TechnicianAssembler.toEntityFromResource(resource);
            technicians.value.push(newTechnician);
        }).catch(error =>{
            errors.value.push(error);
        })
    }
    function addTechnicianSchedule(schedule){
        autoRepairApi.createTechnician(schedule).then(response =>{
            const resource = response.data;
            const newSchedule = TechnicianScheduleAssembler.toEntityFromResource(resource);
            techniciansSchedule.value.push(newSchedule);
        }).catch(error =>{
            errors.value.push(error);
        })
    }

    function deleteTechnician(id_technician){
        if(!id_technician) return;
        autoRepairApi.deleteTechnician(id_technician)
            .then(()=>{
                const index = technicians.value.findIndex(v => v.id_technician === id_technician);
                if(index !== -1) technicians.value.splice(index, 1);
            }).catch(error =>{
                errors.value.push(error);
        })

    }
    function deleteTechnicianSchedule(id_schedule){
        if(!id_schedule) return;
        autoRepairApi.deleteTechnicianSchedule(id_schedule).then(()=>{
            const index = techniciansSchedule.value.findIndex(v=> v.id_technician_schedule === id_schedule);
            if(index !== -1) technicians.value.splice(index, 1);
        }).catch(error =>{
            errors.value.push(error);
        })
    }

    function getTechnicianById(id_technician){
        return technicians.value.find(v => v.id_technician === id_technician);
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