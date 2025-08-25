import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Hubspot } from './hubspot.entity';
import { Tone } from './tone.entity';
import { Activity } from './activity.entity';
import { UserRole } from 'lib/constant/user.constants';

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name: string | null;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'boolean', name: 'is_activate', default: true })
    isActivate: boolean;

    @Column({ type: 'varchar', length: 20, default: UserRole.USER })
    role: UserRole;

    @OneToMany(() => Hubspot, (hubspot) => hubspot.user, { cascade: true })
    hubspots: Hubspot[];

    @OneToMany(() => Tone, (tone) => tone.user, { cascade: true })
    tones: Tone[];

    @OneToMany(() => Activity, (activity) => activity.user, { cascade: true })
    activities: Activity[];
}
