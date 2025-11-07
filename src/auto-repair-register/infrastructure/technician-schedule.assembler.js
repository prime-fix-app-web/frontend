import {TechnicianSchedule} from "@/auto-repair-register/domain/model/technician-schedule.entity.js";

export class TechnicianScheduleAssembler {

    static toEntityFromResource(resource){
        return new TechnicianSchedule({...resource});
    }

    static toEntitiesFromResponse(response){
        if(response.status !== 200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        let resources = response.data instanceof Array ?response.data: response.data["technician-schedule"];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}