import { Controller, Delete, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/hubspots?portalId=xxx -> boolean
  @UseGuards(JwtAuthGuard)
  @Get('hubspots/has')
  async hasHubspot(@CurrentUser('id') userId: string, @Query('portalId') portalId: string) {
    return this.usersService.hasHubspotPortal(userId, portalId);
  }

  // GET /users/hubspots -> list
  @UseGuards(JwtAuthGuard)
  @Get('hubspots')
  async listHubspots(@CurrentUser('id') userId: string) {
    return this.usersService.listMyHubspots(userId);
  }

  // DELETE /users/hubspots/:id -> boolean
  @UseGuards(JwtAuthGuard)
  @Delete('hubspots/:id')
  async deleteHubspot(@CurrentUser('id') userId: string, @Param('id') hubspotId: string) {
    return this.usersService.deleteMyHubspot(userId, hubspotId);
  }
}
