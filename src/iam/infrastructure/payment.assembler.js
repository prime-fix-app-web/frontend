import {Payment} from "@/iam/domain/model/payment.entity.js";

export class PaymentAssembler {
    static toEntityFromResource(resource) {
        return new Payment({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['payments'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}