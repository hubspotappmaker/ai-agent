import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Hubspot } from './hubspot.entity';
import { ProviderType, PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';

type ProviderPreset = (typeof PROVIDER_TYPE_PRESETS)[keyof typeof PROVIDER_TYPE_PRESETS];

@Entity({ name: 'providers' })
export class Provider extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 550, nullable: true })
  key: string | null;

  @Column({ type: 'int', name: 'max_token', default: 0 })
  maxToken: number;

  @Column({ type: 'varchar', length: 50, name: 'type_key' })
  typeKey: ProviderType;

  @Column({ type: 'json', nullable: true, name: 'type' })
  type: ProviderPreset | null;

  @Column({ type: 'text', nullable: true })
  prompt: string | null;

  @ManyToOne(() => Hubspot, (hubspot) => hubspot.providers, { onDelete: 'CASCADE' })
  hubspot: Hubspot;

  @Column({ type: 'boolean', default: false, name: 'is_used' })
  isUsed: boolean;
}

