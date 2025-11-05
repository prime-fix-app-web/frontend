import {Diagnostic} from "@/data-collection-diagnosis/domain/model/diagnostic.entity.js";

export class DiagnosticAssembler {

    static toEntityFromResource(resource){
        return new Diagnostic({...resource});
    }

    static toEntitiesFromResponse(response){
        if(response.status === 200){
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ?response.data: response.data['diagnostics'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}