/**
 * Auth Interceptor
 * Sets up an Axios interceptor to automatically include authentication headers in requests.
 * Supports both JWT (AWS) and API Key (Supabase) authentication.
 *
 * @param {Object} params - The parameters for setting up the interceptor.
 * @param {Object} params.apiConfig - The API configuration object
 * @param {import('axios').AxiosInstance} params.axiosInstance - The Axios instance to which the interceptor will be applied.
 * @param {boolean} params.isPrimary - Whether this is the primary client (true) or fallback (false)
 */
export function setupAuthInterceptor({ apiConfig, axiosInstance, isPrimary = true }) {
    if (!apiConfig || !axiosInstance) {
        console.error("setupAuthInterceptor: missing apiConfig or axiosInstance");
        return;
    }

    /**
     * Request Interceptor
     */
    axiosInstance.interceptors.request.use(
        (config) => {
            config.headers = config.headers || {};

            const requestUrl = config.url || '';
            const fullUrl = `${config.baseURL}${requestUrl}`;

            // Check if this is a public auth endpoint (no authentication needed)
            const isPublicEndpoint = apiConfig.isPublicAuthEndpoint(fullUrl);

            // Check if this is an AWS-only auth endpoint
            const isAwsAuthEndpoint = apiConfig.isAwsAuthEndpoint(fullUrl);


            // Determine if we should use Supabase auth (API Key)
            // NEVER use Supabase for AWS auth endpoints
            const useSupabaseAuth = !isAwsAuthEndpoint && (apiConfig.shouldUseSupabaseAuth(fullUrl) || !isPrimary);

            // Solo agregar headers de autenticación si NO es un endpoint público
            if (!isPublicEndpoint) {
                if (useSupabaseAuth && apiConfig.supabaseApiKey) {
                    // Use Supabase API Key authentication
                    config.headers['apikey'] = apiConfig.supabaseApiKey;
                    config.headers['Authorization'] = `Bearer ${apiConfig.supabaseApiKey}`;
                } else if (!useSupabaseAuth) {
                    // Use JWT authentication for AWS
                    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
                    }
                }
            }

            // Set default headers
            if (!config.headers['Accept']) {
                config.headers['Accept'] = 'application/json';
            }

            const method = (config.method || 'get').toLowerCase();
            if (['post', 'put', 'patch'].includes(method) && !config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }

            // Add Prefer header for Supabase (but NOT for AWS auth endpoints)
            if (useSupabaseAuth && !isAwsAuthEndpoint && !config.headers['Prefer']) {
                config.headers['Prefer'] = 'return=representation';
            }

            return config;
        },
        (error) => {
            console.error("Request interceptor error:", error);
            return Promise.reject(error);
        }
    );

    /**
     * Response Interceptor
     * Handles fallback logic when using AWS primary strategy
     */
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error) => {
            // Log error for debugging
            console.error(`API Error [${isPrimary ? 'Primary' : 'Fallback'}]:`, {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message
            });

            // If this is the primary client, and it failed, the BaseEndpoint will handle fallback
            // For now, just reject the error
            return Promise.reject(error);
        }
    );
}

