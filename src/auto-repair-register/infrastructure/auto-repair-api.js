import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const techniciansRegisterEndpointPath = import.meta.env.VITE_USER_ACCOUNTS_ENDPOINT_PATH;


export class AutorepairApi extends BaseApi {
    #techniciansRegisterEndpoint;


    constructor() {
        super();

        this.#techniciansRegisterEndpoint = new BaseEndpoint(this, techniciansRegisterEndpointPath);
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