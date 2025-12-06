/**
 * Represents a Service entity
 * @class
 */
export class Service {

    /**
     * Creates a new Service instance
     * @param {Object} params - The parameters for the Service.
     * @param {number}[params.id=''] - The unique identifier for the service.
     * @param {string}[params.name=''] - The name of the service.
     * @param {string}[params.description=''] - The description of the service.
     */
    constructor({id=null,name='',description=''}) {
        this.id=id;
        this.name=name;
        this.description=description;

    }

}