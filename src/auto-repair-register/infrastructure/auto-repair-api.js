import {BaseApi} from "@/shared/infrastructure/http/base-api.js";
import {BaseEndpoint} from "@/shared/infrastructure/http/base-endpoint.js";

const technicianEndpointPath = import.meta.env.VITE_TECHNICIANS_ENDPOINT_PATH;
const technicianScheduleEndpointPath = import.meta.env.VITE_TECHNICIANS_SCHEDULE_ENDPOINT_PATH;

const technicianQueryKey = import.meta.env.VITE_TECHNICIANS_QUERY_PATH;
const technicianScheduleQueryKey = import.meta.env.VITE_TECHNICIANS_SCHEDULE_QUERY_PATH;

export class AutoRepairRegisterApi extends BaseApi {
    #techniciansEndpoint;
    #technicianScheduleEndpoint;

    constructor() {
        super();
        this.#techniciansEndpoint = new BaseEndpoint(this, technicianEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey:technicianQueryKey
        })
        this.#technicianScheduleEndpoint = new BaseEndpoint(this, technicianScheduleEndpointPath,{
            usePathParams:import.meta.env.VITE_USE_PATH_PARAMS,
            idQueryParamKey: technicianScheduleQueryKey
        })
    }

    getTechnicians() {
        return this.#techniciansEndpoint.getAll();
    }

    getTechnicianById(id) {
        return this.#techniciansEndpoint.getById(id);
    }

    createTechnician(resource) {
        return this.#techniciansEndpoint.create(resource);
    }

    updateTechnician(id,resource) {
        return this.#techniciansEndpoint.update(id, resource);

    }
    deleteTechnician(id) {
        return this.#techniciansEndpoint.delete(id);
    }

    getTechnicianSchedule(){
        return this.#technicianScheduleEndpoint.getAll();
    }

    getTechnicianScheduleById(id){
        return this.#technicianScheduleEndpoint.getById(id);
    }

    updateTechnicianSchedule(id,resource){
        return this.#technicianScheduleEndpoint.update(id, resource);
    }

    deleteTechnicianSchedule(id){
        return this.#technicianScheduleEndpoint.delete(id);
    }
}