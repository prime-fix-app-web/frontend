/**
 * Represents a Payment entity.
 * @class
 */
export class Payment {
    /**
     * Creates a new Category instance.
     * @param {Object} params - The parameters for the category.
     * @param {?number} [params.id=null] - The unique identifier for the payment.
     * @param {string} [params.card_number=''] - The number of the card.
     * @param {string} [params.card_type=''] - The type of the card.
     * @param {number} [params.month=0] - The expiration month of the card.
     * @param {number} [params.year=0] - The expiration year of the card.
     * @param {number} [params.cvv=0] - The CVV code of the card.
     * @param {?number} [params.user_account_id=null] - The identifier for the user account.
     */
    constructor({ id = null, card_number = '', card_type= '', month = 0,
                    year= 0, cvv = 0, user_account_id=null}) {
        this.id = id;
        this.card_number = card_number;
        this.card_type=card_type;
        this.month = month;
        this.year = year;
        this.cvv = cvv;
        this.user_account_id = user_account_id;
    }

}