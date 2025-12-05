/**
 * Represents a Service entity in the Data Collection Bounded Context.
 * @class
 */
export class Service {

    /**
     * Creates a new Service instance
     * @param {Object} params - The parameters for the Service.
     * @param {?number}[params.id=null] - The unique identifier for the service.
     * @param {string}[params.name=''] - The name of the service.
     * @param {string}[params.description=''] - The description of the service.
     */
    constructor({id=null,name='',description=''}) {
        this.id=id;
        this.name=name;
        this.description=description;
    }
}