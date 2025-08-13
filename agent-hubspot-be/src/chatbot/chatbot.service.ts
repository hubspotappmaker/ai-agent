import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChatWithMeDto } from './dto/chat-with-me.dto';
import { ProviderRepository } from 'lib/repository/provider.repository';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import axios from 'axios';
import { PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';

@Injectable()
export class ChatbotService {
    constructor(
        private readonly providerRepository: ProviderRepository,
        private readonly hubspotRepository: HubspotRepository,
    ) {}

    async chatWithGPT(userId: string, payload: ChatWithMeDto) {
        const { portalId, messages } = payload;

        const hubspot = await this.hubspotRepository.findOne({
            where: { user: { id: userId }, portalId },
            relations: { providers: true },
        });
        if (!hubspot) {
            throw new NotFoundException('Hubspot portal not found for user');
        }

        const provider = hubspot.providers?.find((p) => p.isUsed && p.typeKey === 'CHAT_GPT');
        if (!provider) {
            throw new NotFoundException('ChatGPT provider is not active for this portal');
        }
        if (!provider.key) {
            throw new UnauthorizedException('Provider API key is missing');
        }

        const preset = provider.type ? PROVIDER_TYPE_PRESETS[provider.typeKey] : undefined;
        const availableModels = preset?.model ?? [];
        const model = availableModels[provider.defaultModel] ?? availableModels[0] ?? 'gpt-4o-mini';
        const maxTokens = provider.maxToken && provider.maxToken > 0 ? provider.maxToken : 150;

        const requestBody = {
            model,
            messages: messages && messages.length > 0 ? messages : [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: '' },
            ],
            max_tokens: maxTokens,
        };

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${provider.key}`,
                    'Content-Type': 'application/json',
                },
            },
        );
        return response.data;
    }
}
