import dataxios from "../helper/axios.wrapper"
import type { HistoryParams, HistoryResponse } from "../types/history"

export const getHistory = async (params: HistoryParams): Promise<HistoryResponse> => {
    const { portalId, limit = 20, offset = 0 } = params;
    const URL_BACKEND = `/activities/portal?portalId=${portalId}&limit=${limit}&offset=${offset}`;
    return await dataxios.get(URL_BACKEND)
}