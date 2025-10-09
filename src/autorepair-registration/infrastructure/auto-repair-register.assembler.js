import { AutoRepair } from '@/autorepair-registration/domain/model/auto-repair-register.entity.js';

export class AutoRepairRegisterAssembler {


    static toEntityFromResource(resource) {
        return new AutoRepair({...resource})
    }


    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['auto repairs'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}