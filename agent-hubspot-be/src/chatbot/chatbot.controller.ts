import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ChatWithMeDto } from './dto/chat-with-me.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  
  @Post("chat-with-gpt")
  async chatWithMe(
    @CurrentUser('id') userId: string,
    @Body() body: ChatWithMeDto,
  ) {
    return this.chatbotService.chatWithGPT(userId, body);
  }
}
