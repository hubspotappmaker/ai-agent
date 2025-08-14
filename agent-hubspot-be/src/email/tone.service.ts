import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateToneDto, UpdateToneDto } from './dto/tone.dto';
import { ToneRepository } from 'lib/repository/tone.repository';
import { User } from 'lib/entity/user.entity';
import { Tone } from 'lib/entity/tone.entity';

@Injectable()
export class ToneService {
  constructor(private readonly toneRepository: ToneRepository) {}

  async create(createToneDto: CreateToneDto, user: User) {
    const tone = this.toneRepository.create({ ...createToneDto, user });
    return await this.toneRepository.save(tone);
  }

  async findAll(user: User) {
    const tones = await this.toneRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'ASC' },
    });

    if (tones.length === 0) return tones;

    const hasDefault = tones.some((t) => t.isDefault);
    if (!hasDefault) {
      // Set the first one as default
      await this.toneRepository.update(tones[0].id, { isDefault: true });
      tones[0].isDefault = true;
    }

    return tones;
  }

  async findOne(id: string, user: User) {
    return await this.toneRepository.findOne({ where: { id, user: { id: user.id } } });
  }

  async update(id: string, updateToneDto: UpdateToneDto, user: User) {
    await this.toneRepository.update({ id, user: { id: user.id } }, updateToneDto);
    return await this.findOne(id, user);
  }

  async remove(id: string, user: User) {
    const tone = await this.findOne(id, user);
    if (tone) {
      await this.toneRepository.delete({ id, user: { id: user.id } });
      return tone;
    }
    return null;
  }

  async setDefault(id: string, user: User): Promise<Tone> {
    // Ensure tone exists and belongs to user
    const target = await this.findOne(id, user);
    if (!target) {
      throw new NotFoundException('Tone not found');
    }

    await this.toneRepository.manager.transaction(async (manager) => {
      // Set all user's tones to false
      await manager.update(Tone, { user: { id: user.id } }, { isDefault: false });
      // Set selected tone to true
      await manager.update(Tone, { id: target.id, user: { id: user.id } }, { isDefault: true });
    });

    return (await this.findOne(id, user)) as Tone;
  }
}