import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import { UserRepository } from 'lib/repository/user.repository';
import { SampleChatRepository } from 'lib/repository/sample-chat.repository';
import { SampleChat } from 'lib/entity/sample-chat.entity';
import { CreateSampleChatDto, SampleChatItemDto } from './dto/sample-chat.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly hubspotRepository: HubspotRepository,
    private readonly userRepository: UserRepository,
    private readonly sampleChatRepository: SampleChatRepository,
  ) {}

  async hasHubspotPortal(userId: string, portalId: string): Promise<boolean> {
    const count = await this.hubspotRepository.count({ where: { user: { id: userId }, portalId } });
    return count > 0;
  }

  async listMyHubspots(userId: string) {
    return this.hubspotRepository.find({
      where: { user: { id: userId } },
      select: {
        id: true,
        email: true,
        portalId: true,
        accountType: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteMyHubspot(userId: string, hubspotId: string): Promise<boolean> {
    const hubspot = await this.hubspotRepository.findOne({ where: { id: hubspotId, user: { id: userId } } });
    if (!hubspot) {
      throw new NotFoundException('Hubspot not found');
    }
    await this.hubspotRepository.remove(hubspot);
    return true;
  }

  async getSampleChats(userId: string, portalId: string): Promise<SampleChatItemDto[]> {
    const hubspot = await this.hubspotRepository.findOne({ where: { user: { id: userId }, portalId } });
    if (!hubspot) {
      throw new NotFoundException('Hubspot not found');
    }

    const sampleChats = await this.sampleChatRepository.find({
      where: { hubspot: { id: hubspot.id } },
      order: { createdAt: 'DESC' },
    });

    return sampleChats.map(chat => ({
      id: chat.id,
      content: chat.content
    }));
  }

  async getSampleChatById(userId: string, portalId: string, sampleChatId: string): Promise<SampleChatItemDto> {
    const hubspot = await this.hubspotRepository.findOne({ where: { user: { id: userId }, portalId } });
    if (!hubspot) {
      throw new NotFoundException('Hubspot not found');
    }

    const sampleChat = await this.sampleChatRepository.findOne({
      where: { id: sampleChatId, hubspot: { id: hubspot.id } },
    });

    if (!sampleChat) {
      throw new NotFoundException('Sample chat not found');
    }

    return {
      id: sampleChat.id,
      content: sampleChat.content
    };
  }

  async createSampleChat(userId: string, portalId: string, createDto: CreateSampleChatDto): Promise<SampleChatItemDto> {
    const hubspot = await this.hubspotRepository.findOne({ where: { user: { id: userId }, portalId } });
    if (!hubspot) {
      throw new NotFoundException('Hubspot not found');
    }

    const newSampleChat = new SampleChat();
    newSampleChat.content = createDto.content;
    newSampleChat.hubspot = hubspot;

    const savedSampleChat = await this.sampleChatRepository.save(newSampleChat);

    return {
      id: savedSampleChat.id,
      content: savedSampleChat.content
    };
  }

  async updateSampleChat(userId: string, portalId: string, sampleChatId: string, updateDto: CreateSampleChatDto): Promise<SampleChatItemDto> {
    const hubspot = await this.hubspotRepository.findOne({ where: { user: { id: userId }, portalId } });
    if (!hubspot) {
      throw new NotFoundException('Hubspot not found');
    }

    const sampleChat = await this.sampleChatRepository.findOne({
      where: { id: sampleChatId, hubspot: { id: hubspot.id } },
    });

    if (!sampleChat) {
      throw new NotFoundException('Sample chat not found');
    }

    sampleChat.content = updateDto.content;
    const updatedSampleChat = await this.sampleChatRepository.save(sampleChat);

    return {
      id: updatedSampleChat.id,
      content: updatedSampleChat.content
    };
  }

  async deleteSampleChat(userId: string, portalId: string, sampleChatId: string): Promise<boolean> {
    const hubspot = await this.hubspotRepository.findOne({ where: { user: { id: userId }, portalId } });
    if (!hubspot) {
      throw new NotFoundException('Hubspot not found');
    }

    const sampleChat = await this.sampleChatRepository.findOne({
      where: { id: sampleChatId, hubspot: { id: hubspot.id } },
    });

    if (!sampleChat) {
      throw new NotFoundException('Sample chat not found');
    }

    await this.sampleChatRepository.remove(sampleChat);
    return true;
  }

  async deleteAllSampleChats(userId: string, portalId: string): Promise<boolean> {
    const hubspot = await this.hubspotRepository.findOne({ where: { user: { id: userId }, portalId } });
    if (!hubspot) {
      throw new NotFoundException('Hubspot not found');
    }

    const sampleChats = await this.sampleChatRepository.find({
      where: { hubspot: { id: hubspot.id } },
    });

    if (sampleChats.length > 0) {
      await this.sampleChatRepository.remove(sampleChats);
    }
    
    return true;
  }
}
