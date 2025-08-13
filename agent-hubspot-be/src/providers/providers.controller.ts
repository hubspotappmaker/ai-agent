import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Provider } from 'lib/entity/provider.entity';

@ApiTags('Providers')
@ApiBearerAuth('access-token')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  // GET /providers?portalId=xxx
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List providers for a portal' })
  @ApiQuery({ name: 'portalId', required: true, description: 'Hubspot portal id' })
  @ApiOkResponse({ type: Provider, isArray: true })
  async list(@CurrentUser('id') userId: string, @Query('portalId') portalId: string) {
    return this.providersService.listProvidersByPortal(userId, portalId);
  }

  // PATCH /providers/:id?portalId=xxx { key?, maxToken? }
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update provider key and maximum token' })
  @ApiParam({ name: 'id', description: 'Provider id' })
  @ApiQuery({ name: 'portalId', required: true, description: 'Hubspot portal id' })
  @ApiBody({ type: UpdateProviderDto })
  @ApiOkResponse({ type: Provider })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') providerId: string,
    @Query('portalId') portalId: string,
    @Body() body: UpdateProviderDto,
  ) {
    return this.providersService.updateProvider(userId, portalId, providerId, body);
  }

  // GET /providers/:id?portalId=xxx
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get provider detail' })
  @ApiParam({ name: 'id', description: 'Provider id' })
  @ApiQuery({ name: 'portalId', required: true, description: 'Hubspot portal id' })
  @ApiOkResponse({ type: Provider })
  async detail(
    @CurrentUser('id') userId: string,
    @Param('id') providerId: string,
    @Query('portalId') portalId: string,
  ) {
    return this.providersService.getProviderDetail(userId, portalId, providerId);
  }

  // POST /providers/:id/select?portalId=xxx
  @UseGuards(JwtAuthGuard)
  @Post(':id/select')
  @ApiOperation({ summary: 'Select a provider as active (only one can be active at a time per portal)' })
  @ApiParam({ name: 'id', description: 'Provider id' })
  @ApiQuery({ name: 'portalId', required: true, description: 'Hubspot portal id' })
  @ApiOkResponse({ schema: { properties: { success: { type: 'boolean', example: true } } } })
  async select(
    @CurrentUser('id') userId: string,
    @Param('id') providerId: string,
    @Query('portalId') portalId: string,
  ) {
    return this.providersService.selectProvider(userId, portalId, providerId);
  }
}
