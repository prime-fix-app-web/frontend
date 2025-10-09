import useIamStore from "@/iam/application/iam.store.js";

/**
 * Navigation guard to protect routes that require authentication.
 * @param to - The target Route Object being navigated to.
 * @param from - The current route being navigated away from.
 * @param next - Function to resolve the hook. Must be called to resolve the hook.
 * @returns {void}
 */
export function authGuard(to, from, next) {
    const iamStore = useIamStore();

    if (iamStore.isAuthenticated) {
        next();
    } else {
        next({ name: 'login', query: { redirect: to.fullPath } });
    }
}