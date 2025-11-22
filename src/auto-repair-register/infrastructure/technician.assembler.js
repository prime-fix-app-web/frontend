import {Technician} from "@/auto-repair-register/domain/model/technician.entity.js";

export class TechnicianAssembler {
    static toEntityFromResource(resource) {
        return new Technician({...resource});
    }

    static toEntitiesFromResponse(response){
        if(response.status !==200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data["technicians"];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}