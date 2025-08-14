import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ChatWithMeDto } from './dto/chat-with-me.dto';
import { ProviderRepository } from 'lib/repository/provider.repository';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import axios from 'axios';
import { PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';
import { TokenService } from 'lib/service/token.service';
import { CONTACT_SYSTEM_PROMPT } from 'lib/constant/prompt';

@Injectable()
export class ChatbotService {
    constructor(
        private readonly providerRepository: ProviderRepository,
        private readonly hubspotRepository: HubspotRepository,
        private readonly tokenService: TokenService,
    ) { }

    async chatWithGPT(userId: string, payload: ChatWithMeDto) {
        const { portalId, messages, contactId } = payload;
        const contactInfo = await this.getContactInfo(portalId, contactId);

        const hubspot = await this.hubspotRepository.findOne({
            where: { user: { id: userId }, portalId },
            relations: { providers: true },
        });
        if (!hubspot) throw new NotFoundException('Hubspot portal not found for user');

        const provider = hubspot.providers?.find((p) => p.isUsed && p.typeKey === 'CHAT_GPT');
        if (!provider) throw new NotFoundException('ChatGPT provider is not active for this portal');
        if (!provider.key) throw new BadRequestException('Provider API key is missing');

        const preset = provider.type ? PROVIDER_TYPE_PRESETS[provider.typeKey] : undefined;
        const availableModels = preset?.model ?? [];
        const model = availableModels[provider.defaultModel] ?? availableModels[0] ?? 'gpt-4o-mini';
        const maxTokens = provider.maxToken && provider.maxToken > 0 ? provider.maxToken : 150;

        // 1) Tạo system prompt (KHÔNG đưa vào vai 'user')
        const systemPrompt = contactInfo
            ? CONTACT_SYSTEM_PROMPT +
            `\ncurrentDate: ${new Date().toISOString().slice(0, 10)}` +
            `\nHere is the context about the contact you are chatting with:\n${typeof contactInfo === 'string' ? contactInfo : JSON.stringify(contactInfo)
            }`
            : 'You are a helpful assistant.';

        const userMessages = (messages && messages.length > 0)
            ? messages
            : [{ role: 'user', content: 'What is the work email of this contact?' }];

        const requestBody = {
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                ...userMessages,
            ],
            max_tokens: maxTokens,
            temperature: 0.2,
            top_p: 1,
            presence_penalty: 0,
            frequency_penalty: 0,
        };

        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${provider.key}`,
                    'Content-Type': 'application/json',
                },
            },
        );

        return response.data.choices?.[0]?.message?.content ?? '';
    }


    async getContactInfo(portalId: string, contactId: string): Promise<string> {
        try
        {
            const hubspotToken = await this.tokenService.getTokenPortalId(portalId);
            console.log('hubspotToken', hubspotToken);
            const properties = [
                'hs_object_id', 'createdate', 'lastmodifieddate', 'firstname', 'lastname',
                'email', 'phone', 'mobilephone', 'fax', 'jobtitle', 'company', 'website',
                'salutation', 'address', 'address2', 'city', 'state', 'zip', 'country',
                'lifecyclestage', 'hs_lead_status', 'hubspot_owner_id', 'hubspot_owner_assigneddate',
                'hubspot_team_id', 'notes_last_contacted', 'notes_last_updated',
                'notes_next_activity_date', 'first_conversion_date', 'first_conversion_event_name',
                'recent_conversion_date', 'recent_conversion_event_name', 'num_conversion_events',
                'num_unique_conversion_events', 'num_associated_deals', 'num_notes',
                'hs_analytics_source', 'hs_analytics_source_data_1', 'hs_analytics_source_data_2',
                'ip_city', 'ip_state', 'ip_country', 'ip_country_code', 'ip_state_code',
                'ip_timezone', 'ip_zipcode', 'industry', 'numberofemployees', 'timezone',
                'hs_language'
            ];

            const response = await axios.get(
                `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?archived=false&properties=${properties.join('&properties=')}`,
                {
                    headers: {
                        'Authorization': `Bearer ${hubspotToken}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return JSON.stringify(response.data);
        } catch (error)
        {
            console.error('Error fetching contact info:', error);
            return '';
        }
    }
}
