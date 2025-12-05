import { AutoRepair } from '@/auto-repair-catalog/domain/model/auto-repair.entity.js'

/**
 * Assembler for converting API to AutoRepair entities
 * @class
 */
export class AutoRepairAssembler {
    /**
     * Converts a plain resource object to a AutoRepair entities
     * @param {Object}resource - The resource object representing a services
     * @returns {AutoRepair} The corresponding AutoRepairs entity
     */
    static toEntityFromResource(resource){
        return new AutoRepair({...resource});
    }

    /**
     *  Converts an API response to an array of AutoRepairs entities
     *  Handles both array and object response formats
     *  Logs an error and return an empty array if the response status is not 200
     * @param {import('axios').AxiosResponse} response - The API response containing service data.
     * @returns {AutoRepair[]} Array of AutoRepair entities
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`)
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['auto_repairs'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
