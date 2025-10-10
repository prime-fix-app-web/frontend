import axios from "axios";

/**
 * Sets up an Axios interceptor to add authentication headers to requests.
 * @param apiKey - The API key to include in the headers.
 * @param BaseUrl - The base URL to match for adding headers.
 * @param axiosInstance - Optional specific axios instance to apply interceptors to.
 * @returns {void}
 */
export function setupAuthInterceptor({ apiKey, BaseUrl, axiosInstance = null }) {
    if (!apiKey || !BaseUrl) {
        console.error('setupAuthInterceptor: Missing required parameters', { apiKey: !!apiKey, BaseUrl: !!BaseUrl });
        return;
    }

    // Use the provided instance or the global axios
    const targetAxios = axiosInstance || axios;
    const instanceType = axiosInstance ? 'specific instance' : 'global axios';

    // Request interceptor
    targetAxios.interceptors.request.use((config) => {
        // For specific instances, we don't need to check the URL since it's already scoped
        const shouldApplyHeaders = axiosInstance ||
            (config.url && (
                config.url.startsWith(BaseUrl) ||
                config.url.startsWith('/') ||
                !config.url.startsWith('http')
            ));

        if (shouldApplyHeaders) {
            config.headers = config.headers || {};
            config.headers['apikey'] = apiKey;
            config.headers['Authorization'] = `Bearer ${apiKey}`;
            config.headers['Content-Type'] = 'application/json';
        } else {
            console.log(`Auth interceptor NOT applied to ${instanceType}:`, config.url);
        }

        return config;
    }, (error) => {
        console.error(`Request interceptor error (${instanceType}):`, error);
        return Promise.reject(error);
    });

    // Response interceptor to handle errors
    targetAxios.interceptors.response.use(
        (response) => {
            return response;
        },
        (error) => {
            return Promise.reject(error);
        }
    );
}