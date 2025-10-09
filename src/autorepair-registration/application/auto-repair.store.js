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

    function fetchAutoRepairRegisters() {
        loading.value = true;
        autorepairApi.getAutoRepairRegisters().then(response => {
            autoRepairRegisters.value = AutoRepairRegisterAssembler.toEntitiesFromResponse(response);
            autoRepairRegistersLoaded.value = true;
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function getAutoRepairRegisterById(id) {
        return autoRepairRegisters.value.find(register => register.id === String(id));
    }

    function addAutoRepairRegister(register) {
        loading.value = true;
        autorepairApi.createAutoRepairRegister(register).then(response => {
            const resource = response.data;
            const newRegister = AutoRepairRegisterAssembler.toEntityFromResource(resource);
            autoRepairRegisters.value.push(newRegister);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function updateAutoRepairRegister(register) {
        loading.value = true;
        autorepairApi.updateAutoRepairRegister(register).then(response => {
            const resource = response.data;
            const updatedRegister = AutoRepairRegisterAssembler.toEntityFromResource(resource);
            const index = autoRepairRegisters.value.findIndex(reg => reg.id === updatedRegister.id);
            if (index !== -1) autoRepairRegisters.value[index] = updatedRegister;
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function deleteAutoRepairRegister(register) {
        loading.value = true;
        autorepairApi.deleteAutoRepairRegister(register.id).then(() => {
            const index = autoRepairRegisters.value.findIndex(reg => reg.id === register.id);
            if (index !== -1) autoRepairRegisters.value.splice(index, 1);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    // ======= TECHNICIAN REGISTER METHODS ======= //

    function fetchTechnicians() {
        loading.value = true;
        autorepairApi.getTechnicians().then(response => {
            technicians.value = TechnicianRegisterAssembler.toEntitiesFromResponse(response);
            techniciansLoaded.value = true;
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function getTechnicianById(id) {
        return technicians.value.find(technician => technician.id === String(id));
    }

    function addTechnician(technician) {
        loading.value = true;
        autorepairApi.createTechnician(technician).then(response => {
            const resource = response.data;
            const newTechnician = TechnicianRegisterAssembler.toEntityFromResource(resource);
            technicians.value.push(newTechnician);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function updateTechnician(technician) {
        loading.value = true;
        autorepairApi.updateTechnician(technician).then(response => {
            const resource = response.data;
            const updatedTechnician = TechnicianRegisterAssembler.toEntityFromResource(resource);
            const index = technicians.value.findIndex(tech => tech.id === updatedTechnician.id);
            if (index !== -1) technicians.value[index] = updatedTechnician;
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
    }

    function deleteTechnician(technician) {
        loading.value = true;
        autorepairApi.deleteTechnician(technician.id).then(() => {
            const index = technicians.value.findIndex(tech => tech.id === technician.id);
            if (index !== -1) technicians.value.splice(index, 1);
            loading.value = false;
        }).catch(error => {
            errors.value.push(error);
            loading.value = false;
        });
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
        deleteTechnician
    };
});

export default useAutoRepairRegisterStore;