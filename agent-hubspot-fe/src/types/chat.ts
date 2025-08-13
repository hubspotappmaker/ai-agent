export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
    role: ChatRole;
    content: string;
}

export interface ChatWithGptBody {
    portalId: string;
    messages: ChatMessage[];
}
