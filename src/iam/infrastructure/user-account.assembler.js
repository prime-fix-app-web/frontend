import {UserAccount} from "@/iam/domain/model/user-account.entity.js";

/**
 * Assembler for UserAccount entities from API resources and responses.
 */
export class UserAccountAssembler {
    /**
     * Converts a single API resource to a UserAccount entity.
     * @param resource - The API resource object.
     * @returns {UserAccount} - The corresponding UserAccount entity.
     */
    static toEntityFromResource(resource) {
        return new UserAccount({ ...resource });
    }

    /**
     * Converts a UserAccount entity to a resource object for API requests.
     * Excludes the id field for create operations.
     * @param {UserAccount} entity - The UserAccount entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id_user_account: entity.id,
            username: entity.username,
            email: entity.email,
            id_user: entity.id_user,
            id_role: entity.id_role,
            id_membership: entity.id_membership,
            password: entity.password
        };
    }

    /**
     * Converts an API response to an array of UserAccount entities.
     * @param response - The API response object.
     * @returns {UserAccount[]} - An array of UserAccount entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['user-accounts'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}