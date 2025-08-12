import { Injectable } from '@nestjs/common';
import { HubspotRepository } from 'lib/repository/hubspot.repository';
import { UserRepository } from 'lib/repository/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly hubspotRepository: HubspotRepository,
    private readonly userRepository: UserRepository,
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
}
