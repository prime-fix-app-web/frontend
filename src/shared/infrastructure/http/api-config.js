/**
 * API Configuration
 * Manages API strategy, fallback logic, and provider URLs
 */

export const API_STRATEGY = {
    SUPABASE_ONLY: 'supabase-only',
    AWS_PRIMARY: 'aws-primary'
};

/**
 * API Configuration class
 * Handles environment-based configuration for API calls
 */
export class ApiConfig {
    constructor() {
        // Mode
        this.mode = import.meta.env.VITE_MODE || 'development';

        // API Strategy
        this.apiStrategy = import.meta.env.VITE_API_STRATEGY || 'supabase-only';

        // Path params
        this.usePathParams = import.meta.env.VITE_USE_PATH_PARAMS === 'true';

        // Provider URLs
        this.primaryApiUrl = import.meta.env.VITE_PRIMEFIX_PROVIDER_API_BASE_URL || 'http://localhost:3000/api/v1';
        this.awsApiUrl = import.meta.env.VITE_PRIMEFIX_PROVIDER_API_BASE_URL_AWS || '';
        this.supabaseApiUrl = import.meta.env.VITE_PRIMEFIX_PROVIDER_API_BASE_URL_SUPABASE || '';

        // Supabase API Key
        this.supabaseApiKey = import.meta.env.VITE_SUPABASE_API_KEY || '';

        // Endpoints
        this.endpoints = {
            autoRepairs: import.meta.env.VITE_AUTOREPAIRS_ENDPOINT_PATH || '/auto_repairs',
            locations: import.meta.env.VITE_LOCATIONS_ENDPOINT_PATH || '/locations',
            memberships: import.meta.env.VITE_MEMBERSHIPS_ENDPOINT_PATH || '/memberships',
            notifications: import.meta.env.VITE_NOTIFICATIONS_ENDPOINT_PATH || '/notifications',
            payments: import.meta.env.VITE_PAYMENTS_ENDPOINT_PATH || '/payments',
            vehicles: import.meta.env.VITE_VEHICLES_ENDPOINT_PATH || '/vehicles',
            roles: import.meta.env.VITE_ROLES_ENDPOINT_PATH || '/roles',
            services: import.meta.env.VITE_SERVICES_ENDPOINT_PATH || '/services',
            userAccounts: import.meta.env.VITE_USER_ACCOUNTS_ENDPOINT_PATH || '/user_accounts',
            users: import.meta.env.VITE_USERS_ENDPOINT_PATH || '/users',
            visits: import.meta.env.VITE_VISITS_ENDPOINT_PATH || '/visits',
            ratings: import.meta.env.VITE_RATINGS_ENDPOINT_PATH || '/ratings',
            technicians: import.meta.env.VITE_TECHNICIANS_ENDPOINT_PATH || '/technicians',
            technicianSchedules: import.meta.env.VITE_TECHNICIANS_SCHEDULE_ENDPOINT_PATH || '/technician_schedules',
            diagnostics: import.meta.env.VITE_DIAGNOSTIC_ENDPOINT_PATH || '/diagnostics',
            expectedVisits: import.meta.env.VITE_EXPECTED_ENDPOINT_PATH || '/expected_visits',

            // Auth endpoints
            authSignIn: import.meta.env.VITE_AUTH_SIGN_IN_ENDPOINT_PATH || '/authentication/sign-in',
            authSignUpOwner: import.meta.env.VITE_AUTH_SIGN_UP_OWNER_ENDPOINT_PATH || '/authentication/sign-up/vehicle-owner',
            authSignUpWorkshop: import.meta.env.VITE_AUTH_SIGN_UP_WORKSHOP_ENDPOINT_PATH || '/authentication/sign-up/auto-repair',
        };
    }

    /**
     * Determines if the current strategy is AWS-primary
     * @returns {boolean}
     */
    get isAwsPrimary() {
        return this.apiStrategy === API_STRATEGY.AWS_PRIMARY;
    }

    /**
     * Determines if the current strategy is Supabase-only
     * @returns {boolean}
     */
    get isSupabaseOnly() {
        return this.apiStrategy === API_STRATEGY.SUPABASE_ONLY;
    }

    /**
     * Gets the current active base URL based on strategy
     * @returns {string}
     */
    get currentBaseUrl() {
        return this.primaryApiUrl;
    }

    /**
     * Gets the fallback URL (Supabase when AWS is primary)
     * @returns {string}
     */
    get fallbackUrl() {
        return this.isAwsPrimary ? this.supabaseApiUrl : '';
    }

    /**
     * Determines if should use path params for a given URL
     * AWS uses path params (/users/1)
     * Supabase uses query params (?id=eq.1)
     * @param {string} url - The full URL to check
     * @returns {boolean}
     */
    shouldUsePathParams(url) {
        // If URL contains Supabase URL, use query params (PostgREST style)
        if (url && url.includes(this.supabaseApiUrl)) {
            return false;
        }

        // If URL contains AWS URL or primary URL (when strategy is aws-primary), use path params
        if (url && (url.includes(this.awsApiUrl) || (this.isAwsPrimary && url.includes(this.primaryApiUrl)))) {
            return true;
        }

        // Default: AWS uses path params, Supabase uses query params
        return this.isAwsPrimary;
    }

    /**
     * Determines if an endpoint is a public auth endpoint (no JWT required)
     * @param {string} url - The URL to check
     * @returns {boolean}
     */
    isPublicAuthEndpoint(url) {
        const publicEndpoints = [
            this.endpoints.authSignIn,
            this.endpoints.authSignUpOwner,
            this.endpoints.authSignUpWorkshop,
        ];

        return publicEndpoints.some(endpoint => url.includes(endpoint));
    }

    /**
     * Determines if an endpoint is an AWS-only auth endpoint
     * These endpoints don't exist in Supabase
     * @param {string} url - The URL to check
     * @returns {boolean}
     */
    isAwsAuthEndpoint(url) {
        const awsOnlyEndpoints = [
            this.endpoints.authSignIn,
            this.endpoints.authSignUpOwner,
            this.endpoints.authSignUpWorkshop,
        ];

        return awsOnlyEndpoints.some(endpoint => url.includes(endpoint));
    }

    /**
     * Determines if we should use Supabase auth (API key) for this request
     * @param {string} url - The URL to check
     * @returns {boolean}
     */
    shouldUseSupabaseAuth(url) {
        // NEVER use Supabase auth for AWS-only auth endpoints
        if (this.isAwsAuthEndpoint(url)) {
            return false;
        }

        // Use Supabase auth if:
        // 1. Strategy is supabase-only, OR
        // 2. URL is the Supabase fallback URL
        return this.isSupabaseOnly || url.includes(this.supabaseApiUrl);
    }
}

// Export singleton instance
export const apiConfig = new ApiConfig();

