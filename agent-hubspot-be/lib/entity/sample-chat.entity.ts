import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Hubspot } from './hubspot.entity';

@Entity({ name: 'sample_chats' })
export class SampleChat extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'content', nullable: false })
  content: string;

  @ManyToOne(() => Hubspot, { onDelete: 'CASCADE' })
  hubspot: Hubspot;
}