export class ServiceOffer {

    /**
     * Creates a new ServiceOffer instance.
     *
     * @param {Object} params - The parameters for the service offer.
     * @param {number} [params.id=0] - The unique identifier of the service offer.
     * @param {number} [params.service_id=0] - The identifier of the service associated with the offer.
     * @param {number} [params.auto_repair_id=0] - The identifier of the auto repair shop providing the offer.
     * @param {number} [params.price=0] - The price of the service offer.
     * @param {boolean} [params.is_active=false] - Indicates whether the offer is currently active.
     * @param {number} [params.duration_hour=0] - The estimated duration of the service in hours.
     */
    constructor({id=null, service_id=null, auto_repair_id=null, price=null,is_active=false, duration_hour=0}) {
        this.id = id;
        this.service_id = service_id;
        this.auto_repair_id = auto_repair_id;
        this.price = price;
        this.is_active = is_active;
        this.duration_hour = duration_hour;
    }
}