import {ExpectedVisit} from "@/data-collection-diagnosis/domain/model/expected-visit.entity.js";

/**
 * Assembler for converting API to ExpectedVisit entities
 */
export class ExpectedVisitAssembler {
    /**
     * Converts a plain resource object to a ExpectedVisit entity
     * @param resource - The resource object representing a expected visit
     * @returns {ExpectedVisit} - The corresponding ExpectedVisit entity
     */
    static toEntityFromResource(resource){
        return new ExpectedVisit({...resource});
    }

    /**
     * Converts an API response to an array of ExpectedVisit entities
     * @param {import('axios').AxiosResponse} response - The API response containing expected visit data
     * @returns {ExpectedVisit[]} - Array of ExpectedVisit entities
     */
    static toEntitiesFromResponse(response){
        if(response.status !==200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        let resources = response.data instanceof Array ? response.data: response.data['expected_visit'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}