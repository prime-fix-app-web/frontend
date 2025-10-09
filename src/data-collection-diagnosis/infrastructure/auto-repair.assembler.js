import {AutoRepair} from "@/data-collection-diagnosis/domain/model/auto-repair.entity.js";

/**
 * Assembler for converting API resources to AutoRepair entities
 */
export class AutoRepairAssembler{
    /**
     * Converts a plain resource object to a AutoRepair entity
     * @param {Object}resource - The resource object representing a one Auto Repair
     * @returns {AutoRepair} The corresponding Auto Repair entity
     */
    static toEntityFromResource(resource) {
        return new AutoRepair({...resource})
    }

    /**
     * Converts an API response to an array of AutoRepair entities.
     * Handles both array and object response formats.
     * Logs an error and returns an empty array if the response status is not 200.
     *
     * @param {import('axios').AxiosResponse} response - The API response containing auto repair data.
     * @returns {AutoRepair[]} Array of AutoRepair entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['auto-repairs'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}