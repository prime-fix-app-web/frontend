import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const autoRepairRegisterEndpointPath = import.meta.env.VITE_AUTOREPAIRS_ENDPOINT_PATH;
const technicianRegisterEndpointPath = import.meta.env.VITE_TECHNICIAN_ENDPOINT_PATH;

export class AutorepairApi extends BaseApi {
    #technicianRegisterEndpoint;
    #autoRepairRegisterEndpoint;

    constructor() {
        super();

        this.#autoRepairRegisterEndpoint = new BaseEndpoint(this, autoRepairRegisterEndpointPath);
        this.#technicianRegisterEndpoint = new BaseEndpoint(this, technicianRegisterEndpointPath);
    }

    getAutoRepairRegisters() {
        return this.#autoRepairRegisterEndpoint.getAll();
    }

    getAutoRepairRegisterById(id) {
        return this.#autoRepairRegisterEndpoint.getById(Number(id));
    }

    createAutoRepairRegister(resource) {
        return this.#autoRepairRegisterEndpoint.create(resource);
    }

    updateAutoRepairRegister(resource) {
        return this.#autoRepairRegisterEndpoint.update(Number(resource.id), resource);
    }

    deleteAutoRepairRegister(id) {
        return this.#autoRepairRegisterEndpoint.delete(Number(id));
    }

    // ------------------ TechnicianRegister ------------------

    getTechnicians() {
        return this.#technicianRegisterEndpoint.getAll();
    }

    getTechnicianById(id) {
        return this.#technicianRegisterEndpoint.getById(Number(id));
    }

    createTechnician(resource) {
        return this.#technicianRegisterEndpoint.create(resource);
    }

    updateTechnician(resource) {
        return this.#technicianRegisterEndpoint.update(Number(resource.id), resource);
    }

    deleteTechnician(id) {
        return this.#technicianRegisterEndpoint.delete(Number(id));
    }
}