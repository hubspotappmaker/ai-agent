import dataxios from "../helper/axios.wrapper"

export const chatWithGpt = async (portalId: string) => {
    const URL_BACKEND = `/providers?portalId=${portalId}`;
    return await dataxios.get(URL_BACKEND)
}
