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
     * Converts a User entity to a resource object for API requests.
     * Excludes the id field for create operations.
     * @param {User} entity - The User entity to convert.
     * @returns {Object} - The resource object for the API.
     */
    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            name: entity.name,
            last_name: entity.last_name,
            dni: entity.dni,
            phone_number: entity.phone_number,
            location_id: entity.location_id
        };
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