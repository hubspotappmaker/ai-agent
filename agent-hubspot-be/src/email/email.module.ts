import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { ToneController } from './tone.controller';
import { ToneService } from './tone.service';
import { RepositoriesModule } from 'lib/module/repository.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [EmailController, ToneController],
  providers: [EmailService, ToneService],
})
export class EmailModule {}
