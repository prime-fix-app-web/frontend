import useIamStore from "@/iam/application/iam.store.js";

const VEHICLE_OWNER_ROLE_ID = 1;
const WORKSHOP_ROLE_ID = 2;

/**
 * Role-based route guard (adapted from Angular example)
 * @param {Array<number>} allowedRoles - Roles allowed for this route
 * @returns {Function} - Vue Router navigation guard
 */
export function roleGuard(allowedRoles = []) {
    return async (to, from, next) => {
        const iamStore = useIamStore();

        if (!iamStore.sessionUserAccount && typeof window !== "undefined") {
            iamStore.restoreSessionFromStorage();
        }

        const sessionUserAccount = iamStore.sessionUserAccount;
        const isAuthenticated = iamStore.isAuthenticated;
        const userRole = sessionUserAccount?.role_id;
        const isNew = sessionUserAccount?.is_new;

        if (!isAuthenticated) {
            console.warn("Role Guard: usuario no autenticado — redirigiendo a login");
            next({ name: "login", query: { redirect: to.fullPath } });
            return;
        }

        if (!userRole) {
            console.warn("Role Guard: el usuario no tiene rol asignado");
            next({ name: "login" });
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            console.warn(`Role Guard: acceso denegado — rol ${userRole}, permitido: ${allowedRoles.join(", ")}`);
            const correctLayout =
                userRole === VEHICLE_OWNER_ROLE_ID
                    ? "/layout-owner/dashboard-owner"
                    : "/layout-workshop/dashboard-workshop";

            next(correctLayout);
            return;
        }

        if (isNew) {
            const newUserPath =
                userRole === VEHICLE_OWNER_ROLE_ID
                    ? "/layout-owner/dashboard-owner"
                    : "/layout-workshop/dashboard-workshop";

            if (to.path !== newUserPath) {
                console.log(`Role Guard: redirigiendo usuario nuevo a ${newUserPath}`);
                next(newUserPath);
                return;
            }
        }

        console.log(`Role Guard: acceso permitido para ${userRole} → ${to.path}`);
        next();
    };
}
