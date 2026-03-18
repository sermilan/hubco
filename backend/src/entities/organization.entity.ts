import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';

export type OrganizationType = 'individual' | 'enterprise' | 'education';
export type OrganizationSize = 'small' | 'medium' | 'large';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: ['individual', 'enterprise', 'education'],
    default: 'individual',
  })
  type: OrganizationType;

  @Column({ type: 'varchar', length: 100 })
  industry: string;

  @Column({
    type: 'enum',
    enum: ['small', 'medium', 'large'],
    nullable: true,
  })
  size: OrganizationSize;

  // Contact information
  @Column({ type: 'varchar', length: 255, name: 'contact_person' })
  contactPerson: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  // Enterprise info
  @Column({
    type: 'varchar',
    length: 50,
    name: 'unified_social_credit_code',
    nullable: true,
  })
  unifiedSocialCreditCode: string;

  @Column({ type: 'varchar', length: 500, name: 'license_url', nullable: true })
  licenseUrl: string;

  // Subscription info
  @Column({ type: 'uuid', name: 'subscription_id', nullable: true })
  subscriptionId: string;

  @Column({
    type: 'enum',
    enum: ['trial', 'active', 'expired', 'cancelled'],
    default: 'trial',
    name: 'subscription_status',
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ type: 'timestamp', name: 'trial_end_date', nullable: true })
  trialEndDate: Date;

  // Usage stats
  @Column({ type: 'int', default: 0, name: 'user_count' })
  userCount: number;

  @Column({ type: 'int', default: 0, name: 'scene_count' })
  sceneCount: number;

  @Column({ type: 'int', default: 0, name: 'api_calls_this_month' })
  apiCallsThisMonth: number;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];
}
