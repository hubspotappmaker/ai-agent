import dataxios from "../helper/axios.wrapper"
import type { ChatWithGptBody } from "../types/chat";

export const chatWithGpt = async (data: ChatWithGptBody) => {
    const URL_BACKEND = `/chatbot/chat-with-gpt`;
    return await dataxios.post(URL_BACKEND, data);
};

export const getSampleChats = async (portalId: string) => {
    const URL_BACKEND = `/users/hubspots/${portalId}/sample-chats`;
    return await dataxios.get(URL_BACKEND);
}

export const createSampleChat = async (portalId: string, data: {
    content: string
}) => {
    const URL_BACKEND = `/users/hubspots/${portalId}/sample-chats`;
    return await dataxios.post(URL_BACKEND, data);
}

export const deleteSampleChat = async (portalId: string, sampleChatId: string) => {
    const URL_BACKEND = `/users/hubspots/${portalId}/sample-chats/${sampleChatId}`;
    return await dataxios.delete(URL_BACKEND);
}
