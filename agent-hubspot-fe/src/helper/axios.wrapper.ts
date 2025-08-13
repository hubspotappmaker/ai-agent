import { message } from "antd";
import axios from "axios";

const dataxios = axios.create({
    baseURL: import.meta.env.VITE_BACK_END_URL
});

dataxios.interceptors.request.use(function (config) {
    if (typeof window !== "undefined" && window && window.localStorage &&
        window.localStorage.getItem('access_token'))
    {
        config.headers.Authorization = 'Bearer ' + window.localStorage.getItem('access_token');
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

dataxios.interceptors.response.use(function (response) {
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'data'))
    {
        return response.data
    }
    return response;
}, function (error) {
    if (error && error.response)
    {
        const statusCode = error.response.status;
        const responseData = error.response.data || {};
        const isUnauthorized = statusCode === 401 || responseData.msg === 'Unauthorized';

        // Identify auth endpoints to avoid treating invalid credentials as expired session
        const requestUrl = (error && error.config && error.config.url) || '';
        const isLoginRequest = typeof requestUrl === 'string' && requestUrl.indexOf('/auth/login') !== -1;
        const isRegisterRequest = typeof requestUrl === 'string' && requestUrl.indexOf('/auth/register') !== -1;
        const bypassUnauthorizedHandling = isLoginRequest || isRegisterRequest;

        if (isUnauthorized)
        {
            if (bypassUnauthorizedHandling)
            {
                // Let caller handle invalid credentials; do not clear storage or redirect
                return responseData;
            }

            try {
                // Clear auth-related storage
                if (typeof window !== "undefined" && window && window.localStorage) {
                    window.localStorage.removeItem('access_token');
                    window.localStorage.removeItem('auth.user');
                    window.localStorage.removeItem('auth.email');
                }
            } catch {}

            try {
                const onLoginPage = typeof window !== "undefined" && window && window.location && window.location.pathname === '/login';
                if (!onLoginPage) {
                    message.error('Session expired. Please sign in again.');
                }
            } catch {}

            // Build login URL with preserved Hubspot params from storage (if any)
            try {
                const raw = typeof window !== "undefined" && window && window.localStorage
                    ? window.localStorage.getItem('hubspot.params')
                    : null;
                const params = raw ? JSON.parse(raw) : null;
                const sp = new URLSearchParams();
                if (params) {
                    if (params.type) sp.set('type', String(params.type));
                    if (params.objectId) sp.set('objectId', String(params.objectId));
                    if (params.portalId) sp.set('portalId', String(params.portalId));
                }
                const search = sp.toString();
                const loginUrl = `/login${search ? `?${search}` : ''}`;
                if (typeof window !== "undefined" && window && window.location && window.location.pathname !== '/login') {
                    window.location.href = loginUrl;
                }
            } catch {}

            return responseData;
        }

        if (responseData.msg && responseData.msg !== 'Unauthorized')
        {
            message.error(responseData.msg)
        }
        return responseData;
    }
    return Promise.reject(error);
});

export default dataxios