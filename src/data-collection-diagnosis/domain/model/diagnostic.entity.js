/**
 * Represents a Diagnosis entity
 * @class
 */
export class Diagnostic {
    /**
     * Creates a new Diagnostic instance
     * @param {Object} params - The parameters for the Diagnostic.
     * @param [id_diagnostic]
     * @param [price]
     * @param [id_vehicle]
     * @param [diagnosis]
     * @param [id_expected]
     */
    constructor({id_diagnostic='', price=0.0, id_vehicle='', diagnosis='', id_expected=''}){
        this.id_diagnostic=id_diagnostic;
        this.price=price;
        this.id_vehicle=id_vehicle;
        this.diagnosis=diagnosis;
        this.id_expected=id_expected;
    }
}
