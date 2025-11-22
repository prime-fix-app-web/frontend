import {ExpectedVisit} from "@/data-collection-diagnosis/domain/model/expected-visit.entity.js";

export class ExpectedVisitAssembler {

    static toEntityFromResource(resource){
        return new ExpectedVisit({...resource});
    }

    static toEntitiesFromResponse(response){
        if(response.status !==200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }

        let resources = response.data instanceof Array ? response.data: response.data['expected_visit'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}