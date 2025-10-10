import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { AutoRepairRegisterAssembler } from "../infrastructure/auto-repair-register.assembler.js";
import { TechnicianRegisterAssembler } from "../infrastructure/technician-register.assembler.js";
import { AutorepairApi } from "../infrastructure/auto-repair-api.js";

const autorepairApi = new AutorepairApi();

export const useAutoRepairRegisterStore = defineStore('autoRepairRegister', () => {
    // ------------------ State ------------------
    const autoRepairRegisters = ref([]);
    const technicians = ref([]);
    const errors = ref([]);
    const loading = ref(false);

    const autoRepairRegistersLoaded = ref(false);
    const techniciansLoaded = ref(false);

    // ------------------ Getters ------------------
    const autoRepairRegistersCount = computed(() => {
        return autoRepairRegistersLoaded.value ? autoRepairRegisters.value.length : 0;
    });

    const techniciansCount = computed(() => {
        return techniciansLoaded.value ? technicians.value.length : 0;
    });

    // ======= AUTO REPAIR REGISTER METHODS ======= //

    async function fetchAutoRepairRegisters() {
        loading.value = true;
        errors.value = [];
        try {
            const response = await autorepairApi.getAutoRepairRegisters();
            autoRepairRegisters.value = AutoRepairRegisterAssembler.toEntitiesFromResponse(response);
            autoRepairRegistersLoaded.value = true;
        } catch (error) {
            errors.value.push(error.message);
        } finally {
            loading.value = false;
        }
    }

    function getAutoRepairRegisterById(id) {
        return autoRepairRegisters.value.find(register => register.id === String(id));
    }

    async function addAutoRepairRegister(register) {
        loading.value = true;
        errors.value = [];
        try {
            const resource = AutoRepairRegisterAssembler.toResourceFromEntity(register);
            const response = await autorepairApi.createAutoRepairRegister(resource);
            const newRegister = AutoRepairRegisterAssembler.toEntityFromResource(response.data);
            autoRepairRegisters.value.push(newRegister);
            return newRegister;
        } catch (error) {
            errors.value.push(error.message);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function updateAutoRepairRegister(register) {
        loading.value = true;
        errors.value = [];
        try {
            const resource = AutoRepairRegisterAssembler.toResourceFromEntity(register);
            const response = await autorepairApi.updateAutoRepairRegister(resource);
            const updatedRegister = AutoRepairRegisterAssembler.toEntityFromResource(response.data);

            const index = autoRepairRegisters.value.findIndex(reg => reg.id === updatedRegister.id);
            if (index !== -1) {
                autoRepairRegisters.value[index] = updatedRegister;
            }
            return updatedRegister;
        } catch (error) {
            errors.value.push(error.message);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function deleteAutoRepairRegister(id) {
        loading.value = true;
        errors.value = [];
        try {
            await autorepairApi.deleteAutoRepairRegister(id);
            const index = autoRepairRegisters.value.findIndex(reg => reg.id === id);
            if (index !== -1) {
                autoRepairRegisters.value.splice(index, 1);
            }
        } catch (error) {
            errors.value.push(error.message);
            throw error;
        } finally {
            loading.value = false;
        }
    }

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
        return technicians.value.find(technician => technician.id === String(id));
    }

    async function addTechnician(technician) {
        loading.value = true;
        errors.value = [];
        try {
            const resource = TechnicianRegisterAssembler.toResourceFromEntity(technician);
            const response = await autorepairApi.createTechnician(resource);
            const newTechnician = TechnicianRegisterAssembler.toEntityFromResource(response.data);
            technicians.value.push(newTechnician);
            return newTechnician;
        } catch (error) {
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
            const updatedTechnician = TechnicianRegisterAssembler.toEntityFromResource(response.data);

            const index = technicians.value.findIndex(tech => tech.id === updatedTechnician.id);
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

    async function deleteTechnician(teach) {
        loading.value = true;
        errors.value = [];
        try {
            await autorepairApi.deleteTechnician(tech.id);
            const index = technicians.value.findIndex(tech => tech.id === id);
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
        autoRepairRegisters,
        technicians,
        errors,
        loading,
        autoRepairRegistersLoaded,
        techniciansLoaded,

        // Getters
        autoRepairRegistersCount,
        techniciansCount,

        // Auto Repair Methods
        fetchAutoRepairRegisters,
        getAutoRepairRegisterById,
        addAutoRepairRegister,
        updateAutoRepairRegister,
        deleteAutoRepairRegister,

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