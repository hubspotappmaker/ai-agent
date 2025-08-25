import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { GenerateEmailDto } from './dto/generate-email.dto';
import { SaveTemplateDto } from './dto/save-template.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiProduces, ApiTags, ApiUnauthorizedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('email')
@ApiBearerAuth('access-token')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

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

  @UseGuards(JwtAuthGuard)
  @Post('save-template')
  @ApiOperation({ summary: 'Save email template to HubSpot', description: 'Save email template to HubSpot portal using the provided content and portal ID.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiBody({
    type: SaveTemplateDto,
    required: true,
    examples: {
      basic: {
        summary: 'Basic email template',
        value: {
          content: '<!doctype html><html><head><meta charset="utf-8"><title>Email</title></head><body><h1>Xin chào</h1><p>Nội dung email ở đây.</p></body></html>',
          portalId: '243429254'
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Template saved successfully', schema: { type: 'object', properties: { id: { type: 'number', example: 233332732638 } } } })
  @ApiBadRequestResponse({ description: 'HubSpot access token missing or API error' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  @ApiNotFoundResponse({ description: 'HubSpot portal not found for user' })
  async saveTemplate(
    @CurrentUser('id') userId: string,
    @Body() dto: SaveTemplateDto,
  ) {
    return this.emailService.saveTemplate(userId, dto);
  }
}
