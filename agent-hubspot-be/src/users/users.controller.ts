import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateSampleChatDto, SampleChatItemDto } from './dto/sample-chat.dto';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /users/hubspots?portalId=xxx -> boolean
  @ApiOperation({ summary: 'Check if user has Hubspot with portalId' })
  @ApiQuery({ name: 'portalId', description: 'Portal ID of Hubspot', required: true })
  @ApiOkResponse({ description: 'Returns true if user has Hubspot with portalId, otherwise returns false' })
  @UseGuards(JwtAuthGuard)
  @Get('hubspots/has')
  async hasHubspot(@CurrentUser('id') userId: string, @Query('portalId') portalId: string) {
    return this.usersService.hasHubspotPortal(userId, portalId);
  }

  // GET /users/hubspots -> list
  @ApiOperation({ summary: 'Get list of user\'s Hubspot accounts' })
  @ApiOkResponse({ description: 'List of user\'s Hubspot accounts' })
  @UseGuards(JwtAuthGuard)
  @Get('hubspots')
  async listHubspots(@CurrentUser('id') userId: string) {
    return this.usersService.listMyHubspots(userId);
  }

  // DELETE /users/hubspots/:id -> boolean
  @ApiOperation({ summary: 'Delete user\'s Hubspot account' })
  @ApiParam({ name: 'id', description: 'Hubspot ID', required: true })
  @ApiOkResponse({ description: 'Returns true if deletion is successful' })
  @UseGuards(JwtAuthGuard)
  @Delete('hubspots/:id')
  async deleteHubspot(@CurrentUser('id') userId: string, @Param('id') hubspotId: string) {
    return this.usersService.deleteMyHubspot(userId, hubspotId);
  }

  // GET /users/hubspots/:portalId/sample-chats -> SampleChatItemDto[]
  @ApiOperation({ summary: 'Get list of Hubspot sample chats' })
  @ApiParam({ name: 'portalId', description: 'Portal ID of Hubspot', required: true })
  @ApiOkResponse({ description: 'List of Hubspot sample chats', type: [SampleChatItemDto] })
  @UseGuards(JwtAuthGuard)
  @Get('hubspots/:portalId/sample-chats')
  async getSampleChats(@CurrentUser('id') userId: string, @Param('portalId') portalId: string) {
    return this.usersService.getSampleChats(userId, portalId);
  }

  // GET /users/hubspots/:portalId/sample-chats/:id -> SampleChatItemDto
  @ApiOperation({ summary: 'Get details of a Hubspot sample chat' })
  @ApiParam({ name: 'portalId', description: 'Portal ID of Hubspot', required: true })
  @ApiParam({ name: 'id', description: 'Sample chat ID', required: true })
  @ApiOkResponse({ description: 'Sample chat details', type: SampleChatItemDto })
  @UseGuards(JwtAuthGuard)
  @Get('hubspots/:portalId/sample-chats/:id')
  async getSampleChatById(
    @CurrentUser('id') userId: string,
    @Param('portalId') portalId: string,
    @Param('id') sampleChatId: string,
  ) {
    return this.usersService.getSampleChatById(userId, portalId, sampleChatId);
  }

  // POST /users/hubspots/:portalId/sample-chats -> SampleChatItemDto
  @ApiOperation({ summary: 'Create a new sample chat for Hubspot' })
  @ApiParam({ name: 'portalId', description: 'Portal ID of Hubspot', required: true })
  @ApiBody({ type: CreateSampleChatDto })
  @ApiOkResponse({ description: 'Created sample chat', type: SampleChatItemDto })
  @UseGuards(JwtAuthGuard)
  @Post('hubspots/:portalId/sample-chats')
  async createSampleChat(
    @CurrentUser('id') userId: string,
    @Param('portalId') portalId: string,
    @Body() createDto: CreateSampleChatDto,
  ) {
    return this.usersService.createSampleChat(userId, portalId, createDto);
  }

  // PUT /users/hubspots/:portalId/sample-chats/:id -> SampleChatItemDto
  @ApiOperation({ summary: 'Update a Hubspot sample chat' })
  @ApiParam({ name: 'portalId', description: 'Portal ID of Hubspot', required: true })
  @ApiParam({ name: 'id', description: 'Sample chat ID', required: true })
  @ApiBody({ type: CreateSampleChatDto })
  @ApiOkResponse({ description: 'Updated sample chat', type: SampleChatItemDto })
  @UseGuards(JwtAuthGuard)
  @Put('hubspots/:portalId/sample-chats/:id')
  async updateSampleChat(
    @CurrentUser('id') userId: string,
    @Param('portalId') portalId: string,
    @Param('id') sampleChatId: string,
    @Body() updateDto: CreateSampleChatDto,
  ) {
    return this.usersService.updateSampleChat(userId, portalId, sampleChatId, updateDto);
  }

  // DELETE /users/hubspots/:portalId/sample-chats/:id -> boolean
  @ApiOperation({ summary: 'Delete a Hubspot sample chat' })
  @ApiParam({ name: 'portalId', description: 'Portal ID of Hubspot', required: true })
  @ApiParam({ name: 'id', description: 'Sample chat ID', required: true })
  @ApiOkResponse({ description: 'Returns true if deletion is successful' })
  @UseGuards(JwtAuthGuard)
  @Delete('hubspots/:portalId/sample-chats/:id')
  async deleteSampleChat(
    @CurrentUser('id') userId: string,
    @Param('portalId') portalId: string,
    @Param('id') sampleChatId: string,
  ) {
    return this.usersService.deleteSampleChat(userId, portalId, sampleChatId);
  }

  // DELETE /users/hubspots/:portalId/sample-chats -> boolean
  @ApiOperation({ summary: 'Delete all Hubspot sample chats' })
  @ApiParam({ name: 'portalId', description: 'Portal ID of Hubspot', required: true })
  @ApiOkResponse({ description: 'Returns true if deletion is successful' })
  @UseGuards(JwtAuthGuard)
  @Delete('hubspots/:portalId/sample-chats')
  async deleteAllSampleChats(@CurrentUser('id') userId: string, @Param('portalId') portalId: string) {
    return this.usersService.deleteAllSampleChats(userId, portalId);
  }
}
