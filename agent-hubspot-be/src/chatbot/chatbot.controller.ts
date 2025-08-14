import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { ChatWithMeDto } from './dto/chat-with-me.dto';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@ApiTags('chatbot')
@ApiBearerAuth() // Hiển thị nút Authorize (Bearer token) trong Swagger UI
@Controller("chatbot")
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) { }

  @UseGuards(JwtAuthGuard)
  @Post('chat-with-gpt')
  @ApiOperation({
    summary: 'Chat with GPT',
    description:
      'Send a chat completion request to OpenAI using the active provider configured for the given user and portal.',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiBody({
    type: ChatWithMeDto,
    required: true,
    examples: {
      withMessages: {
        summary: 'With custom messages',
        value: {
          portalId: 'abc123',
          contactId: 'abc123',
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Give me a one-line joke.' },
          ],
        },
      },
      withoutMessages: {
        summary: 'Without messages (service uses default system+user prompt)',
        value: {
          portalId: 'abc123',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Model reply (text content)',
    schema: {
      type: 'string',
      example: 'Here is a short joke for you!',
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for request body',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing/invalid JWT or provider API key is missing',
  })
  @ApiNotFoundResponse({
    description: 'HubSpot portal not found for user or ChatGPT provider not active',
  })
  async chatWithMe(
    @CurrentUser('id') userId: string,
    @Body() body: ChatWithMeDto,
  ) {
    return this.chatbotService.chatWithGPT(userId, body);
  }
}
