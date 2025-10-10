/**
 * Represents a Rating entity.
 * @class
 */
export class Rating {
    /**
     * Creates a new Category instance.
     * @param {Object} params - The parameters for the category.
     * @param {string} [params.id_rating=''] - The unique identifier for the rating.
     * @param {?number} [params.star_rating=''] - The number of stars of the rating.
     * @param {string} [params.comment=''] - The comment of the raing.
     * @param {string} [params.id_auto_repair=null] - The unique identifier for the auto repair.
     * @param {string} [params.id_user_account=null] - The unique identifier for the user account.
     */
    constructor({ id_rating = '', star_rating = null, comment= '', id_auto_repair = '', id_user_account= ''}) {
        this.id = id_rating;
        this.star_rating = star_rating;
        this.comment = comment;
        this.id_auto_repair = id_auto_repair;
        this.id_user_account = id_user_account;
    }

}