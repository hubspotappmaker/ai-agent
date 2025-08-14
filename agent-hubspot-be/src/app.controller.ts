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
    @Res() res: Response,
  ) {
    if (!code)
    {
      throw new BadRequestException('Missing code parameter');
    }

    await this.appService.exchangeCodeForTokens(code, userId);

    if (!userId)
    {
      return res.redirect('https://www.hubspot.com/');
    }

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Connected</title>
    <style>
      html, body { height: 100%; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; }
      .center { height: 100%; display: flex; align-items: center; justify-content: center; color: #334155; }
    </style>
  </head>
  <body>
    <div class="center">You can close this tab now.</div>
    <script>
      try { if (window.opener) { window.opener.postMessage('hubspot_oauth_success', '*'); } } catch (e) {}
      try { window.close(); } catch (e) {}
    </script>
  </body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  @Get('test')
  async createIframe() {
    return this.tokenService.getTokenPortalId("243429254")
  }

  @Get('get-hubspot-install-link')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  async getHubspotInstallLink(@CurrentUser('id') userId: string) {
    return `${process.env.HUBSPOT_LINK}&state=${userId}`
  }
}
