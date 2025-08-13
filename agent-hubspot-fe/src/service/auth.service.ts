import dataxios from "../helper/axios.wrapper"

export const login = async (email: string, password: string) => {
    const URL_BACKEND = '/auth/login'
    const data = {
        email,
        password,
    }
    const res = await dataxios.post(URL_BACKEND, data)
    // Expected shape: { status, data: { user, accessToken }, msg }
    if (res && res.data && res.data.accessToken) {
        // When backend returns axios original response, align
        const { user, accessToken } = res.data
        if (typeof window !== "undefined" && window && window.localStorage) {
            window.localStorage.setItem('access_token', accessToken)
            window.localStorage.setItem('auth.user', JSON.stringify(user))
            window.localStorage.setItem('auth.email', user?.email || '')
        }
    } else if (res && res.data && res.data.data && res.data.data.accessToken) {
        // When wrapper normalized response: res = {status, data, msg}
        const { user, accessToken } = res.data
        if (typeof window !== "undefined" && window && window.localStorage) {
            window.localStorage.setItem('access_token', accessToken)
            window.localStorage.setItem('auth.user', JSON.stringify(user))
            window.localStorage.setItem('auth.email', user?.email || '')
        }
    }
    return res
}

export const register = async (name: string, email: string, password: string) => {
    const URL_BACKEND = '/auth/register'
    const data = {
        name,
        email,
        password,
    }
    const res = await dataxios.post(URL_BACKEND, data)
    if (res && res.data && res.data.accessToken) {
        const { user, accessToken } = res.data
        if (typeof window !== "undefined" && window && window.localStorage) {
            window.localStorage.setItem('access_token', accessToken)
            window.localStorage.setItem('auth.user', JSON.stringify(user))
            window.localStorage.setItem('auth.email', user?.email || '')
        }
    } else if (res && res.data && res.data.data && res.data.data.accessToken) {
        const { user, accessToken } = res.data
        if (typeof window !== "undefined" && window && window.localStorage) {
            window.localStorage.setItem('access_token', accessToken)
            window.localStorage.setItem('auth.user', JSON.stringify(user))
            window.localStorage.setItem('auth.email', user?.email || '')
        }
    }
    return res
}

export const pingMe = async () => {
    const URL_BACKEND = '/auth/me'
    return await dataxios.get(URL_BACKEND)
}

export const hasHubspot = async (portalId: string) => {
    const URL_BACKEND = `/users/hubspots/has?portalId=${portalId}`;
    return await dataxios.get(URL_BACKEND)
}

export const getHubspotInstallLink = async () => {
    const URL_BACKEND = '/get-hubspot-install-link'
    return await dataxios.get(URL_BACKEND)
}

export const getHubspotAccount = async () => {
    const URL_BACKEND = '/users/hubspots'
    return await dataxios.get(URL_BACKEND)
}

export const deleteHubspotAccount = async (id: string) => {
    const URL_BACKEND = `/users/hubspots/${id}`
    return await dataxios.delete(URL_BACKEND)
}