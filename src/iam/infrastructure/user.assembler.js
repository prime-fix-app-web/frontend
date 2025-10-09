import {User} from "@/iam/domain/model/user.entity.js";

/**
 * Assembler for converting user resources to User entities.
 */
export class UserAssembler {
    /**
     * Converts a resource object to a User entity.
     * @param resource - The resource object to convert.
     * @returns {User} - The resulting User entity.
     */
    static toEntityFromResource(resource) {
        return new User({ ...resource });
    }

    /**
     * Converts an array of resource objects to an array of User entities.
     * @param response - The API response containing user data
     * @returns {User[]} - An array of User entities.
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['users'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}