/**
 * Represents a Rating entity.
 * @class
 */
export class Rating {
    /**
     * Creates a new Category instance.
     * @param {Object} params - The parameters for the category.
     * @param {?number} [params.id=null] - The unique identifier for the rating.
     * @param {?number} [params.star_rating=''] - The number of stars of the rating.
     * @param {string} [params.comment=''] - The comment of the rating.
     * @param {string} [params.time_rating=''] - The time when the rating was made.
     * @param {?number} [params.auto_repair_id=null] - The unique identifier for the auto repair.
     * @param {?number} [params.user_account_id=null] - The unique identifier for the user account.
     */
    constructor({ id = null, star_rating = null, comment= '', time_rating = '',
                    auto_repair_id = null, user_account_id= null}) {
        this.id = id;
        this.star_rating = star_rating;
        this.comment = comment;
        this.time_rating = time_rating;
        this.id_auto_repair = auto_repair_id;
        this.id_user_account = user_account_id;
    }

}