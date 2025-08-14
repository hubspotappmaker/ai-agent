import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiProduces, ApiTags, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('email')
@ApiBearerAuth('access-token')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @UseGuards(JwtAuthGuard)
  @Post('generate')
  @ApiOperation({ summary: 'Generate email content by ChatGPT', description: 'Generate email content using OpenAI completions API. If user has a default tone, it will be used as tonal guidance.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiQuery({ name: 'portalId', required: true, description: 'HubSpot portal id associated with providers' })
  @ApiBody({
    type: GenerateEmailDto,
    required: true,
    examples: {
      basic: {
        summary: 'Basic prompt',
        value: {
          content: 'Write a short follow-up email after a product demo.'
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Generated email text', schema: { type: 'string', example: 'Subject: Quick follow-up...\nHi ...' } })
  @ApiBadRequestResponse({ description: 'Provider API key missing or validation failed' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  @ApiNotFoundResponse({ description: 'HubSpot portal or provider not configured' })
  async generate(
    @CurrentUser('id') userId: string,
    @Query('portalId') portalId: string,
    @Body() dto: GenerateEmailDto,
  ) {
    return this.emailService.generateEmail(userId, portalId, dto);
  }
}
