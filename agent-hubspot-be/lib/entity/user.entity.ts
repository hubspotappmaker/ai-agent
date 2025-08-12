import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 100, name: 'portal_id', nullable: true })
    portalId: string;

    @Column({ type: 'varchar', length: 100, name: 'account_type', nullable: true })
    accountType: string;

    @Column({ type: 'text', name: 'access_token', nullable: true })
    accessToken: string;

    @Column({ type: 'text', name: 'refresh_token', nullable: true })
    refreshToken: string;

    @Column({ type: 'boolean', name: 'is_activate', default: true })
    isActivate: boolean;
}
