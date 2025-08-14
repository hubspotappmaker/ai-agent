import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ToneService } from './tone.service';
import { CreateToneDto, UpdateToneDto } from './dto/tone.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'lib/entity/user.entity';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiBadRequestResponse, ApiUnauthorizedResponse, ApiNotFoundResponse, ApiConsumes, ApiProduces } from '@nestjs/swagger';
import { Tone } from 'lib/entity/tone.entity';

@ApiTags('Tones')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('tones')
export class ToneController {
  constructor(private readonly toneService: ToneService) {}

  @Post()
  @ApiOperation({ summary: 'Create a tone', description: 'Create a new tone for the current user.' })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiBody({
    type: CreateToneDto,
    required: true,
    examples: {
      basic: {
        summary: 'Minimal tone',
        value: {
          title: 'Friendly',
          description: 'Warm, supportive tone ideal for onboarding emails.',
        },
      },
      professional: {
        summary: 'Professional tone',
        value: {
          title: 'Professional',
          description: 'Formal and concise, suitable for business updates.',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Created tone',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '2f6c8f1a-5c44-4c0a-8b4c-1234567890ab' },
        title: { type: 'string', example: 'Friendly' },
        description: { type: 'string', example: 'Warm, supportive tone ideal for onboarding emails.' },
        isDefault: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed for request body' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  create(@Body() createToneDto: CreateToneDto, @CurrentUser() user: User) {
    return this.toneService.create(createToneDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List tones', description: 'List all tones of the current user. If none is default, the first (oldest) will be set as default automatically.' })
  @ApiProduces('application/json')
  @ApiOkResponse({
    description: 'List of tones',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '9b3c5f1d-2a34-4e56-8c78-90ab12cd34ef' },
          title: { type: 'string', example: 'Friendly' },
          description: { type: 'string', example: 'Warm, supportive tone ideal for onboarding emails.' },
          isDefault: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
        },
      },
      example: [
        {
          id: '9b3c5f1d-2a34-4e56-8c78-90ab12cd34ef',
          title: 'Friendly',
          description: 'Warm, supportive tone ideal for onboarding emails.',
          isDefault: true,
          createdAt: '2025-01-01T10:00:00.000Z',
          updatedAt: '2025-01-01T10:00:00.000Z',
        },
        {
          id: '7a1d2c3b-4e5f-6789-abcd-ef0123456789',
          title: 'Professional',
          description: 'Formal and concise, suitable for business updates.',
          isDefault: false,
          createdAt: '2025-01-02T10:00:00.000Z',
          updatedAt: '2025-01-02T10:30:00.000Z',
        },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  findAll(@CurrentUser() user: User) {
    return this.toneService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tone details' })
  @ApiParam({ name: 'id', description: 'Tone id (UUID)', schema: { type: 'string', format: 'uuid', example: '2f6c8f1a-5c44-4c0a-8b4c-1234567890ab' } })
  @ApiOkResponse({
    description: 'Tone details',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '2f6c8f1a-5c44-4c0a-8b4c-1234567890ab' },
        title: { type: 'string', example: 'Friendly' },
        description: { type: 'string', example: 'Warm, supportive tone ideal for onboarding emails.' },
        isDefault: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Tone not found' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.toneService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a tone' })
  @ApiParam({ name: 'id', description: 'Tone id (UUID)', schema: { type: 'string', format: 'uuid', example: '7a1d2c3b-4e5f-6789-abcd-ef0123456789' } })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiBody({
    type: UpdateToneDto,
    examples: {
      updateTitle: {
        summary: 'Update only title',
        value: { title: 'Casual' },
      },
      updateDescription: {
        summary: 'Update only description',
        value: { description: 'Relaxed, conversational style with light humor.' },
      },
      updateBoth: {
        summary: 'Update both fields',
        value: { title: 'Empathetic', description: 'Gentle and understanding, ideal for support replies.' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Updated tone',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '7a1d2c3b-4e5f-6789-abcd-ef0123456789' },
        title: { type: 'string', example: 'Empathetic' },
        description: { type: 'string', example: 'Gentle and understanding, ideal for support replies.' },
        isDefault: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-01-03T12:15:00.000Z' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Validation failed for request body' })
  @ApiNotFoundResponse({ description: 'Tone not found' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  update(@Param('id') id: string, @Body() updateToneDto: UpdateToneDto, @CurrentUser() user: User) {
    return this.toneService.update(id, updateToneDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a tone' })
  @ApiParam({ name: 'id', description: 'Tone id (UUID)', schema: { type: 'string', format: 'uuid', example: '9b3c5f1d-2a34-4e56-8c78-90ab12cd34ef' } })
  @ApiOkResponse({
    description: 'Deleted tone',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '9b3c5f1d-2a34-4e56-8c78-90ab12cd34ef' },
        title: { type: 'string', example: 'Professional' },
        description: { type: 'string', example: 'Formal and concise, suitable for business updates.' },
        isDefault: { type: 'boolean', example: false },
        createdAt: { type: 'string', format: 'date-time', example: '2025-01-02T10:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-01-02T10:30:00.000Z' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Tone not found' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.toneService.remove(id, user);
  }

  @Post(':id/default')
  @ApiOperation({ summary: 'Set this tone as default (others will be unset)' })
  @ApiParam({ name: 'id', description: 'Tone id (UUID)', schema: { type: 'string', format: 'uuid', example: '2f6c8f1a-5c44-4c0a-8b4c-1234567890ab' } })
  @ApiOkResponse({
    description: 'Tone set as default',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '2f6c8f1a-5c44-4c0a-8b4c-1234567890ab' },
        title: { type: 'string', example: 'Friendly' },
        description: { type: 'string', example: 'Warm, supportive tone ideal for onboarding emails.' },
        isDefault: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T10:00:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-01-03T12:30:00.000Z' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Tone not found' })
  @ApiUnauthorizedResponse({ description: 'Missing/invalid JWT' })
  setDefault(@Param('id') id: string, @CurrentUser() user: User) {
    return this.toneService.setDefault(id, user);
  }
}