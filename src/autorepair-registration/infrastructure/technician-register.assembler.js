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
        let resources = response.data instanceof Array ? response.data : response.data['technicians'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}