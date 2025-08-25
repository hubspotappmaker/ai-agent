import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ActivityService } from 'lib/service/activity.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'lib/entity/user.entity';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('portal')
  async getActivitiesByPortal(
    @CurrentUser() user: User,
    @Query('portalId') portalId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    if (!portalId) {
      throw new Error('Portal ID is required');
    }

    return this.activityService.getActivitiesByPortal(
      user.id,
      portalId,
      limitNum,
      offsetNum,
    );
  }

  @Get('stats')
  async getTokenUsageStats(
    @CurrentUser() user: User,
    @Query('portalId') portalId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!portalId) {
      throw new Error('Portal ID is required');
    }

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.activityService.getTokenUsageStats(user.id, start, end);
  }
}
