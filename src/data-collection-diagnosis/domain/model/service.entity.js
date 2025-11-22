/**
 * Represents a Service entity
 * @class
 */
export class Service {

    /**
     * Creates a new Service instance
     * @param {Object} params - The parameters for the Service.
     * @param {string}[params.id_service=''] - The unique identifier for the service.
     * @param {string}[params.name=''] - The name of the service.
     * @param {string}[params.description=''] - The description of the service.
     */
    constructor({id_service='',name='',description=''}) {
        this.id_service=id_service;
        this.name=name;
        this.description=description;

    }

}