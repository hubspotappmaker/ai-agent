import dataxios from "../helper/axios.wrapper"

export const getAllTone = async () => {
    const URL_BACKEND = `/tones`;
    return await dataxios.get(URL_BACKEND)
}

export const createNewTone = async (data: {
    title: string,
    description: string
}) => {
    const URL_BACKEND = `/tones`;
    return await dataxios.post(URL_BACKEND, data)
}

export const deleteToneById = async (toneId: string) => {
    const URL_BACKEND = `/tones/${toneId}`;
    return await dataxios.delete(URL_BACKEND)
}

export const changeToDefault = async (toneId: string) => {
    const URL_BACKEND = `/tones/${toneId}/default`;
    return await dataxios.post(URL_BACKEND)
}

export const generateEmail = async (portalId: string, data: {
    content: string
}) => {
    const URL_BACKEND = `/email/generate?portalId=${portalId}`;
    return await dataxios.post(URL_BACKEND, data)
}
export const saveTempleteEmail = async (data: {
    content: string,
    portalId: string
}) => {
    const URL_BACKEND = `/email/save-template`;
    return await dataxios.post(URL_BACKEND, data)
}