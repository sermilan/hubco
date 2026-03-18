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

export type ObligationType = '禁止性' | '强制性' | '推荐性' | '指导性';
export type PenaltyLevel = '刑事' | '高额罚款' | '中等罚款' | '警告整改' | '无';
export type COUStatus = 'current' | 'revised' | 'deprecated';
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

export const PENALTY_WEIGHTS: Record<PenaltyLevel, number> = {
  刑事: 5,
  高额罚款: 4,
  中等罚款: 3,
  警告整改: 2,
  无: 1,
};

@Entity('cous')
@Index(['code'], { unique: true })
@Index(['policyId'])
@Index(['finalWeight'])
export class COU {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // COU编码，如 COU-DSL-001

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'uuid', name: 'source_clause_id' })
  sourceClauseId: string;

  @Column({ type: 'uuid', name: 'policy_id' })
  policyId: string;

  @ManyToOne(() => Policy, (policy) => policy.cous, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'policy_id' })
  policy: Policy;

  @Column({ type: 'varchar', length: 500 })
  policyTitle: string;

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

  // Compliance elements
  @Column({
    type: 'enum',
    enum: ['禁止性', '强制性', '推荐性', '指导性'],
    name: 'obligation_type',
  })
  obligationType: ObligationType;

  @Column({ type: 'text', name: 'action_required' })
  actionRequired: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deadline: string;

  @Column({ type: 'text', nullable: true })
  penalty: string;

  @Column({
    type: 'enum',
    enum: ['刑事', '高额罚款', '中等罚款', '警告整改', '无'],
    name: 'penalty_level',
    nullable: true,
  })
  penaltyLevel: PenaltyLevel;

  // Weight system
  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'base_weight' })
  baseWeight: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    name: 'penalty_weight',
  })
  penaltyWeight: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    name: 'tag_match_score',
  })
  tagMatchScore: number;

  @Column({
    type: 'decimal',
    precision: 4,
    scale: 2,
    name: 'scenario_weight',
  })
  scenarioWeight: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'final_weight' })
  finalWeight: number;

  // Tag system
  @Column({ type: 'simple-json', nullable: true })
  tags: Array<{
    id: string;
    name: string;
    color: string;
    category: string;
  }>;

  @Column({ type: 'simple-json', name: 'five_dimensional_tags' })
  fiveDimensionalTags: {
    objects: string[];
    subjects: string[];
    lifecycles: string[];
    securities: string[];
    actions: string[];
  };

  @Column({ type: 'simple-json', name: 'tag_weights', nullable: true })
  tagWeights: Record<string, number>;

  @Column({ type: 'simple-array', name: 'auto_tags', nullable: true })
  autoTags: string[];

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    name: 'auto_tag_confidence',
    nullable: true,
  })
  autoTagConfidence: number;

  // Action requirements
  @Column({ type: 'simple-json', name: 'action_requirements' })
  actionRequirements: Array<{
    actionCode: string;
    description: string;
    deadline?: string;
    priority: ActionPriority;
    isBlocking: boolean;
    checkPoints: string[];
    deliverables?: string[];
  }>;

  // Applicability
  @Column({ type: 'simple-array', name: 'applicable_industries' })
  applicableIndustries: string[];

  @Column({ type: 'simple-array', name: 'applicable_regions' })
  applicableRegions: string[];

  @Column({ type: 'simple-array', name: 'applicable_user_types' })
  applicableUserTypes: string[];

  // Special elements
  @Column({
    type: 'simple-array',
    name: 'special_requirements',
    nullable: true,
  })
  specialRequirements: string[];

  @Column({ type: 'simple-array', name: 'technical_measures', nullable: true })
  technicalMeasures: string[];

  @Column({
    type: 'simple-array',
    name: 'organizational_measures',
    nullable: true,
  })
  organizationalMeasures: string[];

  // Relations
  @Column({ type: 'simple-array', name: 'related_cous', nullable: true })
  relatedCOUs: string[];

  @Column({ type: 'simple-array', nullable: true })
  dependsOn: string[];

  @Column({ type: 'simple-array', nullable: true })
  conflicts: string[];

  // Version management
  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({
    type: 'enum',
    enum: ['current', 'revised', 'deprecated'],
    default: 'current',
  })
  status: COUStatus;

  @Column({ type: 'simple-json', name: 'version_history', nullable: true })
  versionHistory: Array<{
    versionId: string;
    versionNumber: string;
    status: 'current' | 'revised' | 'deprecated';
    effectiveDate: string;
    supersededBy?: string;
    changeLog?: string;
    impact: 'breaking' | 'compatible' | 'cosmetic';
  }>;

  // LLM metadata
  @Column({ type: 'simple-json', name: 'llm_metadata', nullable: true })
  llmMetadata: {
    decompositionConfidence: number;
    reviewedBy?: string;
    reviewedAt?: string;
    aiSuggestions?: string[];
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
