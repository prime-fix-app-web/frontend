/**
 * Represents a Payment entity.
 * @class
 */
export class Payment {
    /**
     * Creates a new Category instance.
     * @param {Object} params - The parameters for the category.
     * @param {string} [params.id_payment=''] - The unique identifier for the payment.
     * @param {string} [params.card_number=''] - The number of the card.
     * @param {string} [params.card_type=''] - The type of the card.
     * @param {?number} [params.month=null] - The expiration month of the card.
     * @param {?number} [params.year=null] - The expiration year of the card.
     * @param {?number} [params.cvv=null] - The CVV code of the card.
     * @param {string} [params.id_user_account=''] - The identifier for the user account.
     */
    constructor({ id_payment = '', card_number = '', card_type= '', month = null, year= null, cvv = null, id_user_account=''}) {
        this.id = id_payment;
        this.card_number = card_number;
        this.card_type=card_type;
        this.month = month;
        this.year = year;
        this.cvv = cvv;
        this.id_user_account = id_user_account;
    }

}