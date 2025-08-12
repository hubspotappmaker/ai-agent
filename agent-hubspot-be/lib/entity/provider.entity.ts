import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Hubspot } from './hubspot.entity';
import { ProviderTypeName, ProviderTypeKey, PROVIDER_TYPE_PRESETS } from 'lib/constant/provider.constants';

@Entity({ name: 'providers' })
export class Provider extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'int', name: 'max_token', default: 0 })
  maxToken: number;

  @Column({ type: 'json' })
  type: ProviderTypeName;

  @Column({ type: 'varchar', length: 50, name: 'type_key' })
  typeKey: ProviderTypeKey;

  @ManyToOne(() => Hubspot, (hubspot) => hubspot.providers, { onDelete: 'CASCADE' })
  hubspot: Hubspot;
}

