import { Technician } from '@/autorepair-registration/domain/model/technician-register.entity.js';

/**
 * Assembler for converting between TechnicianRegister entities and API resources/responses.
 */
export class TechnicianRegisterAssembler {

    static toEntityFromResource(resource) {
        return new Technician({...resource})
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
            id_user_account: entity.id_user_account,
            username: entity.username,
            email: entity.email,
            id_role: entity.id_role

        };

    }
}