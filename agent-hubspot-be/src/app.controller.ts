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
    @Res() res: Response,
  ) {

    if (!code) {
      throw new BadRequestException('Missing code parameter');
    }

    const tokens = await this.appService.exchangeCodeForTokens(code);

    return res.json(tokens);
  }

  @Get('test')
  async createIframe() {
    return this.tokenService.getTokenPortalId("243162647")
  }
}
