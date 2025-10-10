/**
 * Represents a payment entity.
 * @class
 */
export class Payment {
    /**
     * Creates an instance of Payment.
     * @param {Object} params - The parameters for the payment.
     * @param {string} [params.id_payment=''] - The unique identifier for the payment.
     * @param {?number} [params.card_number=null] - The card number.
     * @param {string} [params.card_type=''] - The type of the card (e.g., Visa, MasterCard).
     * @param {?number} [params.month=null] - The expiration month of the card.
     * @param {?number} [params.year=null] - The expiration year of the card.
     * @param {?number} [params.cvv=null] - The CVV code of the card.
     * @param {string} [params.id_user_account=''] - The identifier for the associated user account.
     */
    constructor({ id_payment = '', card_number = null, card_type = '',
                    month = null, year = null, cvv = null, id_user_account = '' }) {
        this.id_payment = id_payment;
        this.card_number = card_number;
        this.card_type = card_type;
        this.month = month;
        this.year = year;
        this.cvv = cvv;
        this.id_user_account = id_user_account;
    }

    get id() { return this.id_payment; }
    set id(value) { this.id_payment = value; }
}