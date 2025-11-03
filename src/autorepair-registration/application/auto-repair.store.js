import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { TechnicianRegisterAssembler } from "../infrastructure/technician-register.assembler.js";
import { AutorepairApi } from "../infrastructure/auto-repair-api.js";

const autorepairApi = new AutorepairApi();

export const useAutoRepairRegisterStore = defineStore('autoRepairRegister', () => {

    const technicians = ref([]);
    const errors = ref([]);
    const loading = ref(false);


    const techniciansLoaded = ref(false);

    // ------------------ Getters ------------------


    const techniciansCount = computed(() => {
        return techniciansLoaded.value ? technicians.value.length : 0;
    });


    // ======= TECHNICIAN REGISTER METHODS ======= //

    async function fetchTechnicians() {
        loading.value = true;
        errors.value = [];
        try {
            const response = await autorepairApi.getTechnicians();
            technicians.value = TechnicianRegisterAssembler.toEntitiesFromResponse(response);
            techniciansLoaded.value = true;
        } catch (error) {
            errors.value.push(error.message);
        } finally {
            loading.value = false;
        }
    }

    function getTechnicianById(id) {
        return technicians.value.find(technician => technician.id_user_account === String(id));
    }

    async function addTechnician(technician) {
        console.log('🔍 === DEBUG ADD TECHNICIAN STORE ===')
        console.log('📦 Técnico recibido:', technician)

        loading.value = true;
        errors.value = [];
        try {
            console.log('🔄 Convirtiendo a resource...')
            const resource = TechnicianRegisterAssembler.toResourceFromEntity(technician);
            console.log('📦 Resource convertido:', resource)

            console.log('📡 Llamando a API createTechnician...')
            const response = await autorepairApi.createTechnician(resource);
            console.log('✅ Respuesta API:', response)

            // ✅ CORREGIDO - usa toEntityFromResource
            const newTechnician = TechnicianRegisterAssembler.toEntityFromResource(response.data);
            console.log('🎉 Técnico creado:', newTechnician)

            technicians.value.push(newTechnician);
            return newTechnician;
        } catch (error) {
            console.error('💥 ERROR EN STORE:')
            console.error('   Mensaje:', error.message)
            console.error('   Status:', error.response?.status)
            console.error('   Data:', error.response?.data)
            console.error('   URL:', error.config?.url)
            errors.value.push(error.message);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function updateTechnician(technician) {
        loading.value = true;
        errors.value = [];
        try {
            const resource = TechnicianRegisterAssembler.toResourceFromEntity(technician);
            const response = await autorepairApi.updateTechnician(resource);
            const updatedTechnician = TechnicianRegisterAssembler.toEntityFromResource(response.data); // ✅ CORREGIDO

            const index = technicians.value.findIndex(tech => tech.id_user_account === updatedTechnician.id_user_account);
            if (index !== -1) {
                technicians.value[index] = updatedTechnician;
            }
            return updatedTechnician;
        } catch (error) {
            errors.value.push(error.message);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function deleteTechnician(id) {
        loading.value = true;
        errors.value = [];
        try {
            await autorepairApi.deleteTechnician(id);
            const index = technicians.value.findIndex(tech => tech.id_user_account === id);
            if (index !== -1) {
                technicians.value.splice(index, 1);
            }
        } catch (error) {
            errors.value.push(error.message);
            throw error;
        } finally {
            loading.value = false;
        }
    }
    function clearErrors() {
        errors.value = [];
    }
    return {
        // State

        technicians,
        errors,
        loading,
        techniciansLoaded,

        // Getters
        techniciansCount,


        // Technician Methods
        fetchTechnicians,
        getTechnicianById,
        addTechnician,
        updateTechnician,
        deleteTechnician,
        clearErrors

    };
});

export default useAutoRepairRegisterStore;