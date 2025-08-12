// src/app.controller.ts
import { Controller, Get, Query, Res, BadRequestException, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { TokenService } from 'lib/service/token.service';
import { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CurrentUser } from './auth/current-user.decorator';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly tokenService: TokenService
  ) { }


  @Get('oauth')
  async callback(
    @Query('code') code: string,
    @Query('state') userId: string,
  ) {
    if (!code) {
      throw new BadRequestException('Missing code parameter');
    }
    if (!userId) {
      throw new BadRequestException('Missing state (userId) parameter');
    }

    const hubspotAccount = await this.appService.exchangeCodeForTokens(code, userId);
    return { hubspotAccount };
  }

  @Get('test')
  async createIframe() {
    return this.tokenService.getTokenPortalId("243415357")
  }

  @Get('get-hubspot-install-link')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getHubspotInstallLink(@CurrentUser('id') userId: string) {
    return `${process.env.HUBSPOT_LINK}&state=${userId}`
  }
}
