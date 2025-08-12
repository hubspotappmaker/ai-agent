import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as querystring from 'querystring';
import { UserRepository } from 'lib/repository/user.repository';

@Injectable()
export class TokenService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;

    constructor(
        private readonly config: ConfigService,
        private readonly http: HttpService,
        private readonly userRepository: UserRepository,
    ) {
        this.clientId = "7618532b-e62d-431a-a2d1-036faaa3f506";
        this.clientSecret = "d5711e85-fe83-4bfc-92c1-acc4fbb93a8a";
        this.redirectUri = "https://127.0.0.1:8386/oauth";
    }

    async getTokenPortalId(portalId: string) {
        const hubspot = await this.userRepository.findOne({
            where: { portalId: portalId }
        });
        if (!hubspot) {
            return '';
        }
        const last_time = hubspot.updatedAt;
        const refresh_token = hubspot.refreshToken;
        const access_token = hubspot.accessToken;
        const current_time = new Date();

        // Kiểm tra nếu quá 25 phút
        const diffMs = current_time.getTime() - new Date(last_time).getTime();
        const diffMinutes = diffMs / (1000 * 60);

        if (diffMinutes > 25) {
            // Refresh token
            const url = 'https://api.hubapi.com/oauth/v1/token';
            const payload = querystring.stringify({
                grant_type: 'refresh_token',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                redirect_uri: this.redirectUri,
                refresh_token: refresh_token,
            });
            const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };

            const response$ = this.http.post(url, payload, { headers });
            const response = await firstValueFrom(response$);

            if (!response?.data?.access_token) {
                throw new BadRequestException('Failed to refresh access token');
            }

            // Cập nhật user trong DB
            hubspot.accessToken = response.data.access_token;
            if (response.data.refresh_token) {
                hubspot.refreshToken = response.data.refresh_token;
            }
            await this.userRepository.save(hubspot);
            console.log(hubspot.accessToken);
            return hubspot.accessToken;
        } else {
            // Chưa hết hạn, trả ra token hiện tại
            return access_token;
        }
    }
}