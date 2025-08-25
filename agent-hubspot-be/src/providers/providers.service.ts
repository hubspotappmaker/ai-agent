import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProviderRepository } from 'lib/repository/provider.repository';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import { Provider } from 'lib/entity/provider.entity';
import { PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';

@Injectable()
export class ProvidersService {
  constructor(
    private readonly providerRepository: ProviderRepository,
    private readonly hubspotRepository: HubspotRepository,
  ) {}

  async listProvidersByPortal(userId: string, portalId: string) {
    const hubspot = await this.hubspotRepository.findOne({ where: { portalId, user: { id: userId } } });
    if (!hubspot) throw new NotFoundException('Hubspot portal not found');
    const providers = await this.providerRepository.find({ where: { hubspot: { id: hubspot.id } }, order: { createdAt: 'DESC' } });

    // Always update providers with latest constants data
    const providersToUpdate = providers.filter((p) => 
      p.typeKey && (PROVIDER_TYPE_PRESETS as any)[p.typeKey]
    );
    
    if (providersToUpdate.length > 0) {
      await Promise.all(
        providersToUpdate.map((p) =>
          this.providerRepository.update(p.id, { 
            type: (PROVIDER_TYPE_PRESETS as any)[p.typeKey] as any 
          }),
        ),
      );
      return this.providerRepository.find({ where: { hubspot: { id: hubspot.id } }, order: { createdAt: 'DESC' } });
    }

    return providers;
  }

  async updateProvider(
    userId: string,
    portalId: string,
    providerId: string,
    data: { key?: string | null; maxToken?: number; defaultModel?: number },
  ) {
    const hubspot = await this.hubspotRepository.findOne({ where: { portalId, user: { id: userId } } });
    if (!hubspot) throw new NotFoundException('Hubspot portal not found');

    const provider = await this.providerRepository.findOne({ where: { id: providerId, hubspot: { id: hubspot.id } } });
    if (!provider) throw new NotFoundException('Provider not found');

    if (typeof data.maxToken !== 'undefined' && (data.maxToken as number) < 0) {
      throw new BadRequestException('maxToken must be >= 0');
    }
    if (typeof data.defaultModel !== 'undefined' && (data.defaultModel as number) < 0) {
      throw new BadRequestException('defaultModel must be >= 0');
    }

    if (typeof data.key !== 'undefined') provider.key = data.key;
    if (typeof data.maxToken !== 'undefined') provider.maxToken = data.maxToken as number;
    if (typeof data.defaultModel !== 'undefined') provider.defaultModel = data.defaultModel as number;

    await this.providerRepository.save(provider);
    return provider;
  }

  async selectProvider(userId: string, portalId: string, providerId: string) {
    const hubspot = await this.hubspotRepository.findOne({ where: { portalId, user: { id: userId } } });
    if (!hubspot) throw new NotFoundException('Hubspot portal not found');

    const provider = await this.providerRepository.findOne({ where: { id: providerId, hubspot: { id: hubspot.id } } });
    if (!provider) throw new NotFoundException('Provider not found');

    await this.providerRepository.manager.transaction(async (manager) => {
      await manager.update(Provider, { hubspot: { id: hubspot.id } }, { isUsed: false });
      await manager.update(Provider, { id: provider.id }, { isUsed: true });
    });

    return { success: true };
  }

  async getProviderDetail(userId: string, portalId: string, providerId: string) {
    const hubspot = await this.hubspotRepository.findOne({ where: { portalId, user: { id: userId } } });
    if (!hubspot) throw new NotFoundException('Hubspot portal not found');

    const provider = await this.providerRepository.findOne({ where: { id: providerId, hubspot: { id: hubspot.id } } });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }

  async getProviderIsUsed(userId: string, portalId: string) {
    console.log(userId, portalId);
    const hubspot = await this.hubspotRepository.findOne({ where: { portalId, user: { id: userId } } });
    if (!hubspot) throw new NotFoundException('Hubspot portal not found');
    console.log(hubspot);
    const provider = await this.providerRepository.findOne({ where: {hubspot: { id: hubspot.id }, isUsed: true } });
    if (!provider) throw new NotFoundException('Provider not found');
    return provider;
  }
}
