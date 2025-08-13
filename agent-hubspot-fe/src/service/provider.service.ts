import dataxios from "../helper/axios.wrapper"

export const getProviders = async (portalId: string) => {
    const URL_BACKEND = `/providers?portalId=${portalId}`;
    return await dataxios.get(URL_BACKEND)
}

export const updateProvider = async (portalId: string, providerId: string, data: {
    key: string,
    maxToken: number,
    defaultModel: number
}) => {
    const URL_BACKEND = `/providers/${providerId}?portalId=${portalId}`;
    return await dataxios.patch(URL_BACKEND, data)
}

export const selectProvider = async (portalId: string, providerId: string) => {
    const URL_BACKEND = `/providers/${providerId}/select?portalId=${portalId}`;
    return await dataxios.post(URL_BACKEND)
}

export const getCurrentEngine = async (portalId: string) => {
    const URL_BACKEND = `/providers/used?portalId=${portalId}`;
    return await dataxios.get(URL_BACKEND)
}