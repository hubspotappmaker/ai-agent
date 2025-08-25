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

    // Helper function to handle different providers
    private async callAIProvider(provider: any, systemPrompt: string, userMessages: any[], maxTokens: number) {
        const preset = PROVIDER_TYPE_PRESETS[provider.typeKey];
        const availableModels = preset?.model ?? [];
        const model = availableModels[provider.defaultModel] ?? availableModels[0] ?? 'gpt-4o-mini';

        if (provider.typeKey === 'DEEPSEEK') {
            // DeepSeek API call
            const requestBody = {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...userMessages,
                ],
                temperature: 0.3,
                max_tokens: maxTokens,
                stream: false
            };

            try {
                const response = await axios.post(
                    'https://api.deepseek.com/chat/completions',
                    requestBody,
                    {
                        headers: {
                            Authorization: `Bearer ${provider.key}`,
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000, // 30 seconds timeout
                    },
                );

                const content = response.data?.choices?.[0]?.message?.content;
                if (!content) {
                    throw new BadRequestException('DeepSeek API returned empty response');
                }

                return content;
            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    throw new BadRequestException('DeepSeek API request timed out');
                }
                if (error.response) {
                    const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'DeepSeek API error';
                    throw new BadRequestException(`DeepSeek API error: ${errorMessage}`);
                }
                throw new BadRequestException(`DeepSeek API request failed: ${error.message}`);
            }
        } else if (provider.typeKey === 'CLAUDE') {
            // Claude API call
            const requestBody = {
                model: model,
                max_tokens: maxTokens,
                system: systemPrompt,
                messages: userMessages
            };

            try {
                const response = await axios.post(
                    'https://api.anthropic.com/v1/messages',
                    requestBody,
                    {
                        headers: {
                            'x-api-key': provider.key,
                            'anthropic-version': '2023-06-01',
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000, // 30 seconds timeout
                    },
                );

                const content = response.data?.content?.[0]?.text;
                if (!content) {
                    throw new BadRequestException('Claude API returned empty response');
                }

                return content;
            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    throw new BadRequestException('Claude API request timed out');
                }
                if (error.response) {
                    const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'Claude API error';
                    throw new BadRequestException(`Claude API error: ${errorMessage}`);
                }
                throw new BadRequestException(`Claude API request failed: ${error.message}`);
            }
        } else if (provider.typeKey === 'GROK') {
            // Grok API call
            const requestBody = {
                model: model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...userMessages,
                ],
                temperature: 0.4,
                max_tokens: maxTokens,
                stream: false
            };

            try {
                const response = await axios.post(
                    'https://api.x.ai/v1/chat/completions',
                    requestBody,
                    {
                        headers: {
                            Authorization: `Bearer ${provider.key}`,
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000, // 30 seconds timeout
                    },
                );

                const content = response.data?.choices?.[0]?.message?.content;
                if (!content) {
                    throw new BadRequestException('Grok API returned empty response');
                }

                return content;
            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    throw new BadRequestException('Grok API request timed out');
                }
                if (error.response) {
                    const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'Grok API error';
                    throw new BadRequestException(`Grok API error: ${errorMessage}`);
                }
                throw new BadRequestException(`Grok API request failed: ${error.message}`);
            }
        } else {
            // ChatGPT API call (existing logic)
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

            try {
                const response = await axios.post(
                    'https://api.openai.com/v1/chat/completions',
                    requestBody,
                    {
                        headers: {
                            Authorization: `Bearer ${provider.key}`,
                            'Content-Type': 'application/json',
                        },
                        timeout: 30000, // 30 seconds timeout
                    },
                );

                const content = response.data?.choices?.[0]?.message?.content;
                if (!content) {
                    throw new BadRequestException('ChatGPT API returned empty response');
                }

                return content;
            } catch (error) {
                if (error.code === 'ECONNABORTED') {
                    throw new BadRequestException('ChatGPT API request timed out');
                }
                if (error.response) {
                    const errorMessage = error.response.data?.error?.message || error.response.data?.message || 'ChatGPT API error';
                    throw new BadRequestException(`ChatGPT API error: ${errorMessage}`);
                }
                throw new BadRequestException(`ChatGPT API request failed: ${error.message}`);
            }
        }
    }

    async chatWithAI(userId: string, payload: ChatWithMeDto) {
        const { portalId, messages, contactId } = payload;
        const contactInfo = await this.getContactInfo(portalId, contactId);

        const hubspot = await this.hubspotRepository.findOne({
            where: { user: { id: userId }, portalId },
            relations: { providers: true },
        });
        if (!hubspot) throw new NotFoundException('Hubspot portal not found for user');

        // Tìm provider đang được sử dụng (ưu tiên DEEPSEEK, CLAUDE, GROK, sau đó là CHAT_GPT)
        const provider = hubspot.providers?.find((p) => p.isUsed && (p.typeKey === 'DEEPSEEK' || p.typeKey === 'CLAUDE' || p.typeKey === 'GROK' || p.typeKey === 'CHAT_GPT'));
        if (!provider) throw new NotFoundException('No active AI provider found for this portal');
        if (!provider.key) throw new BadRequestException('Provider API key is missing');

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

        return await this.callAIProvider(provider, systemPrompt, userMessages, maxTokens);
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
