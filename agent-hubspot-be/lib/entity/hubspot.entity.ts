import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Provider } from './provider.entity';

@Entity({ name: 'hubspots' })
export class Hubspot extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 100, name: 'portal_id', nullable: false })
  portalId: string;

  @Column({ type: 'varchar', length: 100, name: 'account_type', nullable: true })
  accountType: string | null;

  @Column({ type: 'text', name: 'access_token', nullable: false })
  accessToken: string;

  @Column({ type: 'text', name: 'refresh_token', nullable: false })
  refreshToken: string;

  @ManyToOne(() => User, (user) => user.hubspots, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => Provider, (provider) => provider.hubspot, { cascade: true })
  providers: Provider[];
}

