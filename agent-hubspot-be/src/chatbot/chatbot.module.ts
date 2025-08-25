import { Module } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { RepositoriesModule } from 'lib/module/repository.module';
import { TokenModule } from 'lib/module/token.module';
import { ActivityModule } from 'lib/module/activity.module';

@Module({
  imports: [RepositoriesModule, TokenModule, ActivityModule],
  controllers: [ChatbotController],
  providers: [ChatbotService],
})
export class ChatbotModule {}
