// src/app.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as querystring from 'querystring';
import { UserRepository } from 'lib/repository/user.repository';
import { User } from 'lib/entity/user.entity';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import { ProviderRepository } from 'lib/repository/provider.repository';
import { Hubspot } from 'lib/entity/hubspot.entity';
import { TokenService } from 'lib/service/token.service';
import { GroupConfig } from 'lib/constant/hubspot.constants';
import { PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';

@Injectable()
export class AppService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly config: ConfigService,
    private readonly http: HttpService,
    private readonly userRepository: UserRepository,
    private readonly httpService: HttpService,
    private readonly tokenService: TokenService,
    private readonly hubspotRepository: HubspotRepository,
    private readonly providerRepository: ProviderRepository,
  ) {
    // this.clientId = this.config.get<string>('HUBSPOT_CLIENT_ID')!;
    // this.clientSecret = this.config.get<string>('HUBSPOT_CLIENT_SECRET')!;
    // this.redirectUri = this.config.get<string>('HUBSPOT_REDIRECT_URI')!;

    this.clientId = "daa63ac0-8181-44b8-a832-fce2f51c88a7";
    this.clientSecret = "2e1bdcf2-0df8-4048-a6f2-b31aa668c194";
    this.redirectUri = "https://127.0.0.1:8386/oauth";

  }

  async exchangeCodeForTokens(code: string, userId: string) {
    const url = 'https://api.hubapi.com/oauth/v1/token';
    const payload = querystring.stringify({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code,
    });
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

    const response$ = this.http.post(url, payload, { headers });
    const response = await firstValueFrom(response$);
    if (!response?.data?.access_token)
    {
      throw new BadRequestException('Failed to obtain access token');
    }
    const { access_token, refresh_token } = response.data;
    if(userId) {
      const hubspot = await this.syncHubspotAccount(access_token, refresh_token, userId);
    return hubspot;
    }
    return true;
  }

  async syncHubspotAccount(accessToken: string, refreshToken: string, userId: string): Promise<Hubspot> {
    // 1. Get portal details
    const accountUrl = 'https://api.hubapi.com/account-info/v3/details';
    const accountRes$ = this.http.get(accountUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const accountRes = await firstValueFrom(accountRes$);
    const { portalId, accountType } = accountRes.data;

    // 2. Get user profile
    const usersUrl = 'https://api.hubapi.com/settings/v3/users';
    const usersRes$ = this.http.get(usersUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const usersRes = await firstValueFrom(usersRes$);
    const result = usersRes.data.results[0];
    const email = result.email;
    const firstName = result.firstName !== 'n/a' ? result.firstName : '';
    const lastName = result.lastName !== 'n/a' ? result.lastName : '';
    const name = [firstName, lastName].filter(Boolean).join(' ') || undefined;

    // 3. Upsert Hubspot account linked to the user
    const ownerUser = await this.userRepository.findOne({ where: { id: userId } });
    if (!ownerUser) {
      throw new BadRequestException('Invalid user');
    }

    let hubspot = await this.hubspotRepository.findOne({ where: { portalId: portalId.toString(), user: { id: userId } as any } });
    if (!hubspot) {
      hubspot = this.hubspotRepository.create({ portalId: portalId.toString(), user: ownerUser });
    }
    hubspot.accountType = accountType;
    hubspot.accessToken = accessToken;
    hubspot.email = email;
    hubspot.refreshToken = refreshToken;

    hubspot = await this.hubspotRepository.save(hubspot);

    // 4. Seed some example providers for this hubspot account (idempotent by name)
    const seedProviders = [
      { name: 'ChatGPT', maxToken: 1000, prompt: 'ChatGPT default', typeKey: 'CHAT_GPT' as const, type: PROVIDER_TYPE_PRESETS.CHAT_GPT },
      { name: 'Deepseek', maxToken: 1000, prompt: 'Deepseek default', typeKey: 'DEEPSEEK' as const, type: PROVIDER_TYPE_PRESETS.DEEPSEEK },
      { name: 'Grok', maxToken: 1000, prompt: 'Grok default', typeKey: 'GROK' as const, type: PROVIDER_TYPE_PRESETS.GROK },
      { name: 'Claude', maxToken: 1000, prompt: 'Claude default', typeKey: 'CLAUDE' as const, type: PROVIDER_TYPE_PRESETS.CLAUDE },
    ];

    for (const sp of seedProviders) {
      const existed = await this.providerRepository.findOne({ where: { name: sp.name, hubspot: { id: hubspot.id } as any } });
      if (!existed) {
        const provider = this.providerRepository.create({ ...sp, hubspot });
        await this.providerRepository.save(provider);
      } else {
        // ensure type is populated if missing from old data
        if (!existed.type && existed.typeKey) {
          const preset = (PROVIDER_TYPE_PRESETS as any)[existed.typeKey];
          if (preset) {
            await this.providerRepository.update(existed.id, { type: preset as any });
          }
        }
      }
    }

    return hubspot;
  }

}
