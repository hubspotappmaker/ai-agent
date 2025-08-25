import { Module } from '@nestjs/common';
import { ActivityService } from 'lib/service/activity.service';
import { RepositoriesModule } from './repository.module';

@Module({
  imports: [RepositoriesModule],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
