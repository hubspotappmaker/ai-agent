import { Module } from '@nestjs/common';
import { ActivitiesController } from './activities.controller';
import { ActivityModule } from 'lib/module/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [ActivitiesController],
})
export class ActivitiesModule {}
