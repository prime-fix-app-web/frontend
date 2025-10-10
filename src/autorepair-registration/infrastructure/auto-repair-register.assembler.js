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
        let resources = response.data instanceof Array ? response.data : response.data;

        return resources.map(resource => this.toEntityFromResource(resource));
    }
    static toResourceFromEntity(entity) {
        return {
            id_auto_repair: entity.id_auto_repair,
            ruc: entity.RUC,
            contact_email: entity.contact_email,
            technicians_count: entity.technicians_count,
            id_location: entity.id_location
        };
    }
}