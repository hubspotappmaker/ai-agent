import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import { PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';
import { ToneRepository } from 'lib/repository/tone.repository';
import { GenerateEmailDto } from './dto/generate-email.dto';

@Injectable()
export class EmailService {
  constructor(
    private readonly hubspotRepository: HubspotRepository,
    private readonly toneRepository: ToneRepository,
  ) {}

  // Build a system prompt specifically for generating email content
  private buildEmailSystemPrompt(basePrompt?: string) {
    const defaultPrompt = `You are an AI assistant that generates only email content.\n
Rules:\n- Output must be an email body (and optional subject).\n- Do not include code blocks, explanations, or unrelated text.\n- Keep style professional and concise unless otherwise specified.\n- Return plain text only.`;
    return basePrompt ? `${defaultPrompt}\n\nTone preference:\n${basePrompt}` : defaultPrompt;
  }

  async generateEmail(userId: string, portalId: string, payload: GenerateEmailDto) {
    const { content } = payload;

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
    const maxTokens = provider.maxToken && provider.maxToken > 0 ? provider.maxToken : 300;

    // Fetch default tone (if any) for current user; use description as tonal guidance
    const defaultTone = await this.toneRepository.findOne({ where: { user: { id: userId }, isDefault: true } });
    const systemPrompt = this.buildEmailSystemPrompt(defaultTone?.description || undefined);

    const requestBody: any = {
      model,
      prompt: `${systemPrompt}\n\nUser instruction:\n${content}`,
      max_tokens: maxTokens,
      temperature: 0.2,
    };

    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${provider.key}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const text = response.data?.choices?.[0]?.text ?? '';
    return text;
  }
}
