/**
 * Auth Interceptor
 * Sets up an Axios interceptor to automatically include authentication headers in requests.
 * @param {Object} params - The parameters for setting up the interceptor.
 * @param {string} params.apiKey - The API key to be used for authentication.
 * @param {string} params.baseUrl - The base URL for the API (not used in this function but included for completeness).
 * @param {import('axios').AxiosInstance} params.axiosInstance - The Axios instance to which the interceptor will be applied.
 */
<<<<<<< HEAD
export function setupAuthInterceptor({ apiKey, baseUrl, axiosInstance = null }) {
    if (!apiKey || !axiosInstance) {
        console.error("setupAuthInterceptor: missing apiKey or axiosInstance");
        return;
    }
    /**
     * Request Interceptor
     */
    axiosInstance.interceptors.request.use(
        (config) => {
            config.headers = config.headers || {};
            config.headers['apikey'] = apiKey;
            config.headers['Authorization'] = `Bearer ${apiKey}`;
            if (!config.headers['Accept']) config.headers['Accept'] = 'application/json';
=======
export function setupAuthInterceptor({ apiKey, BaseUrl, getAccessToken }) {
    axios.interceptors.request.use((config) => {
        const url = config.url || '';
        const applies = BaseUrl ? url.startsWith(BaseUrl) : url.startsWith('/api');
        if (applies) {
            config.headers['apiKey'] = apiKey;
>>>>>>> feature/autorepair-catalog

            const m = (config.method || 'get').toLowerCase();
            if (['post', 'put', 'patch'].includes(m) && !config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }

            if (!config.headers['Prefer']) {
                config.headers['Prefer'] = 'return=representation';
            }

            return config;
        },
        (error) => Promise.reject(error)
    );

    /**
     * Response Interceptor
     */
    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject(error)
    );
}