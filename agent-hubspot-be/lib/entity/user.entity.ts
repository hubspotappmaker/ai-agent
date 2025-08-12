import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Hubspot } from './hubspot.entity';
import { Prompt } from './prompt.entity';

@Entity({ name: 'users' })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    name: string | null;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @Column({ type: 'boolean', name: 'is_activate', default: true })
    isActivate: boolean;

    @OneToMany(() => Hubspot, (hubspot) => hubspot.user, { cascade: true })
    hubspots: Hubspot[];

    @OneToMany(() => Prompt, (prompt) => prompt.user, { cascade: true })
    prompts: Prompt[];
    
}
