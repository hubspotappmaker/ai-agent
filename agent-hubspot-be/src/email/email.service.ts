import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import { PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';
import { ToneRepository } from 'lib/repository/tone.repository';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { SaveTemplateDto } from './dto/save-template.dto';
import { TokenService } from 'lib/service/token.service';
import { randomUUID } from 'crypto';

@Injectable()
export class EmailService {
  constructor(
    private readonly hubspotRepository: HubspotRepository,
    private readonly toneRepository: ToneRepository,
    private readonly tokenService: TokenService,
  ) { }

  // Build a system prompt specifically for generating email content
  private buildEmailSystemPrompt(basePrompt?: string) {
    const defaultPrompt = `You are an AI assistant that generates only email content.\n
Rules:\n- Output must be an email body (and optional subject).\n- Do not include code blocks, explanations, or unrelated text.\n- Keep style professional and concise unless otherwise specified.\n- Return plain text only.`;
    return basePrompt ? `${defaultPrompt}\n\nTone preference:\n${basePrompt}` : defaultPrompt;
  }

  // Helper function to handle different providers
  private async callAIProvider(provider: any, systemPrompt: string, userContent: string, maxTokens: number) {
    const preset = PROVIDER_TYPE_PRESETS[provider.typeKey];
    const availableModels = preset?.model ?? [];
    const model = availableModels[provider.defaultModel] ?? availableModels[0] ?? 'gpt-4o-mini';

    if (provider.typeKey === 'DEEPSEEK') {
      // DeepSeek API call
      const requestBody = {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
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
        messages: [
          { role: 'user', content: userContent }
        ]
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
          { role: 'user', content: userContent }
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
      const requestBody: any = {
        model,
        prompt: `${systemPrompt}\n\nUser instruction:\n${userContent}`,
        max_tokens: maxTokens,
        temperature: 0.2,
      };

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/completions',
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${provider.key}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds timeout
          },
        );

        const text = response.data?.choices?.[0]?.text;
        if (!text) {
          throw new BadRequestException('ChatGPT API returned empty response');
        }

        return text;
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

  async generateEmail(userId: string, portalId: string, payload: GenerateEmailDto) {
    const { content } = payload;

    const hubspot = await this.hubspotRepository.findOne({
      where: { user: { id: userId }, portalId },
      relations: { providers: true },
    });
    if (!hubspot) throw new NotFoundException('Hubspot portal not found for user');

    // Tìm provider đang được sử dụng (ưu tiên DEEPSEEK, CLAUDE, GROK, sau đó là CHAT_GPT)
    const provider = hubspot.providers?.find((p) => p.isUsed && (p.typeKey === 'DEEPSEEK' || p.typeKey === 'CLAUDE' || p.typeKey === 'GROK' || p.typeKey === 'CHAT_GPT'));
    if (!provider) throw new NotFoundException('No active AI provider found for this portal');
    if (!provider.key) throw new BadRequestException('Provider API key is missing');

    const maxTokens = provider.maxToken && provider.maxToken > 0 ? provider.maxToken : 300;

    // Fetch default tone (if any) for current user; use description as tonal guidance
    const defaultTone = await this.toneRepository.findOne({ where: { user: { id: userId }, isDefault: true } });
    const systemPrompt = this.buildEmailSystemPrompt(defaultTone?.description || undefined);

    return await this.callAIProvider(provider, systemPrompt, content, maxTokens);
  }

  async saveTemplate(userId: string, payload: SaveTemplateDto) {
    const { content, portalId } = payload;
    console.log(portalId);
    // Find HubSpot portal for the user
    const hubspotToken = await this.tokenService.getTokenPortalId(portalId);

    // Prepare request body for HubSpot API
    const uuid = randomUUID();
    const requestBody = {
      template_type: 2,
      path: `custom/email/${uuid}`,
      is_available_for_new_content: true,
      source: content
    };

    try
    {
      const response = await axios.post(
        'https://api.hubapi.com/content/api/v2/templates',
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // Return the template ID from HubSpot response
      return { id: response.data.id };
    } catch (error)
    {
      if (error.response)
      {
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Unknown error';
        const statusCode = error.response.status;
        throw new BadRequestException(`HubSpot API error (${statusCode}): ${errorMessage}`);
      }
      if (error.request)
      {
        throw new BadRequestException('No response received from HubSpot API');
      }
      throw new BadRequestException(`Failed to save template: ${error.message}`);
    }
  }
}
