import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ChatWithMeDto } from './dto/chat-with-me.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  @UseGuards(JwtAuthGuard)
  @Post("chat-with-gpt")
  async chatWithMe(
    @CurrentUser('id') userId: string,
    @Body() body: ChatWithMeDto,
  ) {
    return this.chatbotService.chatWithGPT(userId, body);
  }
}
