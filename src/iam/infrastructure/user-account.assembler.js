import {UserAccount} from "@/iam/domain/model/user-account.entity.js";

export class UserAccountAssembler {
    static toEntityFromResource(resource) {
        return new UserAccount({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['user-accounts'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}