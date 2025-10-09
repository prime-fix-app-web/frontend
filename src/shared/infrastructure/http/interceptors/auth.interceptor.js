import axios from "axios";

/**
 * Sets up an Axios interceptor to add authentication headers to requests.
 * @param apiKey - The API key to include in the headers.
 * @param BaseUrl - The base URL to match for adding headers.
 * @param getAccessToken - A function that returns the current access token.
 * @returns {void}
 */
export function setupAuthInterceptor({ apiKey, BaseUrl, getAccessToken }) {
    axios.interceptors.request.use((config) => {
        if (config.url.startsWith(BaseUrl)) {
            config.headers['apiKey'] = apiKey;

            const accessToken = getAccessToken();
            if (accessToken) {
                config.headers['Authorization'] = `Bearer ${accessToken}`;
            }
        }
        return config;
    }, (error) => Promise.reject(error));
}