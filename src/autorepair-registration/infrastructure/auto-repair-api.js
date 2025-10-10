import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const autoRepairsRegisterEndpointPath = import.meta.env.VITE_AUTOREPAIRS_ENDPOINT_PATH;
const techniciansRegisterEndpointPath = import.meta.env.VITE_USER_ACCOUNTS_ENDPOINT_PATH;

export class AutorepairApi extends BaseApi {
    #techniciansRegisterEndpoint;
    #autoRepairsRegisterEndpoint;

    constructor() {
        super();

        this.#autoRepairsRegisterEndpoint = new BaseEndpoint(this, autoRepairsRegisterEndpointPath);
        this.#techniciansRegisterEndpoint = new BaseEndpoint(this, techniciansRegisterEndpointPath);
    }

    getAutoRepairRegisters() {
        return this.#autoRepairsRegisterEndpoint.getAll();
    }

    getAutoRepairRegisterById(id) {
        return this.#autoRepairsRegisterEndpoint.getById(id);
    }

    createAutoRepairRegister(resource) {
        return this.#autoRepairsRegisterEndpoint.create(resource);
    }

    updateAutoRepairRegister(resource) {
        return this.#autoRepairsRegisterEndpoint.update(resource.id_auto_repair, resource);}


    deleteAutoRepairRegister(id) {
        return this.#autoRepairsRegisterEndpoint.delete(id);
    }

    // ------------------ TechnicianRegister ------------------

    getTechnicians() {
        return this.#techniciansRegisterEndpoint.getAll();
    }

    getTechnicianById(id) {
        return this.#techniciansRegisterEndpoint.getById(id);
    }

    createTechnician(resource) {
        return this.#techniciansRegisterEndpoint.create(resource);
    }

    updateTechnician(resource) {
        return this.#techniciansRegisterEndpoint.update(resource.id_user_account, resource);
    }

        deleteTechnician(id) {
        return this.#techniciansRegisterEndpoint.delete(id);
    }
}