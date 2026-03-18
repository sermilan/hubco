import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Policy } from './policy.entity';

export type ComplianceType = '禁止性' | '强制性' | '推荐性' | '指导性';

@Entity('clauses')
@Index(['policyId'])
export class Clause {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'policy_id' })
  policyId: string;

  @ManyToOne(() => Policy, (policy) => policy.clauses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policy_id' })
  policy: Policy;

  @Column({ type: 'varchar', length: 50, name: 'policy_version_id' })
  policyVersionId: string;

  @Column({ type: 'varchar', length: 500 })
  policyTitle: string;

  @Column({ type: 'varchar', length: 100 })
  policyCode: string;

  @Column({
    type: 'enum',
    enum: [
      '法律',
      '行政法规',
      '部门规章',
      '国家标准',
      '行业标准',
      '地方性法规',
      '指南指引',
    ],
  })
  policyLevel: string;

  // Clause info
  @Column({ type: 'varchar', length: 100 })
  chapter: string;

  @Column({ type: 'varchar', length: 100 })
  article: string;

  @Column({ type: 'text' })
  content: string;

  // COU relations
  @Column({ type: 'simple-array', name: 'cou_ids' })
  couIds: string[];

  // Weight system
  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'base_weight' })
  baseWeight: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    name: 'compliance_weight',
  })
  complianceWeight: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'final_weight' })
  finalWeight: number;

  // Compliance info
  @Column({
    type: 'enum',
    enum: ['禁止性', '强制性', '推荐性', '指导性'],
  })
  complianceType: ComplianceType;

  @Column({ type: 'text', nullable: true })
  penalty: string;

  // Tags and keywords
  @Column({ type: 'simple-json', nullable: true })
  tags: Array<{
    id: string;
    name: string;
    color: string;
    category: string;
  }>;

  @Column({ type: 'simple-array' })
  keywords: string[];

  @Column({ type: 'simple-array', name: 'auto_keywords', nullable: true })
  autoKeywords: string[];

  // Relations
  @Column({ type: 'simple-array', name: 'related_clauses', nullable: true })
  relatedClauses: string[];

  // Version management
  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({
    type: 'enum',
    enum: ['current', 'superseded', 'deprecated'],
    default: 'current',
  })
  status: string;

  @Column({ type: 'varchar', length: 50, name: 'replaced_by', nullable: true })
  replacedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
