// src/app.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import * as querystring from 'querystring';
import { UserRepository } from 'lib/repository/user.repository';
import { User } from 'lib/entity/user.entity';
import { TokenService } from 'lib/service/token.service';
import { GroupConfig } from 'lib/constant/hubspot.constants';

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
    private readonly tokenService: TokenService
  ) {
    // this.clientId = this.config.get<string>('HUBSPOT_CLIENT_ID')!;
    // this.clientSecret = this.config.get<string>('HUBSPOT_CLIENT_SECRET')!;
    // this.redirectUri = this.config.get<string>('HUBSPOT_REDIRECT_URI')!;

    this.clientId = "daa63ac0-8181-44b8-a832-fce2f51c88a7";
    this.clientSecret = "2e1bdcf2-0df8-4048-a6f2-b31aa668c194";
    this.redirectUri = "https://127.0.0.1:8386/oauth";

  }

  async exchangeCodeForTokens(code: string): Promise<User> {
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

    const user = await this.syncHubspotUser(access_token, refresh_token);
    return user;
  }

  async syncHubspotUser(accessToken: string, refreshToken: string): Promise<User> {
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

    // 3. Upsert in DB
    let user = await this.userRepository.findOne({ where: { portalId: portalId.toString() } });
    if (!user)
    {
      user = this.userRepository.create({ portalId: portalId.toString() });
    }
    user.accountType = accountType;
    user.accessToken = accessToken;
    user.email = email;
    user.name = name || '';
    user.refreshToken = refreshToken;

    return this.userRepository.save(user);
  }

}
