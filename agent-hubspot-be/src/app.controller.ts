// src/app.controller.ts
import { Controller, Get, Query, Res, BadRequestException } from '@nestjs/common';
import { AppService } from './app.service';
import { TokenService } from 'lib/service/token.service';
import { Response } from 'express';

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
    @Res() res: Response,
  ) {
    if (!code) {
      throw new BadRequestException('Missing code parameter');
    }
    if (!userId) {
      throw new BadRequestException('Missing state (userId) parameter');
    }

    const hubspotAccount = await this.appService.exchangeCodeForTokens(code, userId);

    return res.json({ success: true, hubspotAccount });
  }

  @Get('test')
  async createIframe() {
    return this.tokenService.getTokenPortalId("243162647")
  }
}
