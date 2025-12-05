import {Diagnostic} from "@/data-collection-diagnosis/domain/model/diagnostic.entity.js";

/**
 * Assembler for converting API to Diagnostic entities
 */
export class DiagnosticAssembler {
    /**
     * Converts a plain resource object to a Diagnostic entity
     * @param {Object} resource - The resource object representing a diagnostic
     * @returns {Diagnostic} - The corresponding Diagnostic entity
     */
    static toEntityFromResource(resource){
        return new Diagnostic({...resource});
    }

    /**
     * Converts an API response to an array of Diagnostic entities
     * @param {import('axios').AxiosResponse} response - The API response containing diagnostic data
     * @returns {Diagnostic[]} - Array of Diagnostic entities
     */
    static toEntitiesFromResponse(response){
        if(response.status !== 200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ?response.data: response.data['diagnostics'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}