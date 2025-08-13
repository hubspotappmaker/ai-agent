import dataxios from "../helper/axios.wrapper"
import type { ChatWithGptBody } from "../types/chat";

export const chatWithGpt = async (data: ChatWithGptBody) => {
    const URL_BACKEND = `/chatbot/chat-with-gpt`;
    return await dataxios.post(URL_BACKEND, data);
};
