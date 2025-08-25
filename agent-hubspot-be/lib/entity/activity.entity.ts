import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Provider } from './provider.entity';
import { ActivityType, ActivityAction, ActivityStatus } from 'lib/constant/activity.constants';

@Entity({ name: 'activities' })
export class Activity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'varchar', length: 50 })
  action: ActivityAction;

  @Column({ type: 'varchar', length: 20 })
  type: ActivityType;

  @Column({ type: 'int', name: 'max_token', default: 0 })
  maxToken: number;

  @Column({ type: 'varchar', length: 100, name: 'engine_name' })
  engineName: string;

  @Column({ type: 'varchar', length: 100, name: 'model_name' })
  modelName: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: ActivityStatus;

  @Column({ type: 'text', nullable: true, name: 'error_message' })
  errorMessage: string | null;

  @Column({ type: 'int', name: 'execution_time_ms', nullable: true })
  executionTimeMs: number | null;

  // Relationships
  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => Provider, (provider) => provider.activities, { onDelete: 'SET NULL', nullable: true })
  provider: Provider | null;

  @Column({ type: 'uuid', name: 'provider_id', nullable: true })
  providerId: string | null;

  @Column({ type: 'varchar', length: 100, name: 'portal_id' })
  portalId: string;
}
