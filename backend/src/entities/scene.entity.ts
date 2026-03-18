import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type SceneStatus = 'draft' | 'active' | 'archived';
export type SceneCategory = '出海合规' | '行业合规' | '业务合规' | '技术合规';

@Entity('scenes')
@Index(['userId'])
@Index(['organizationId'])
export class Scene {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId: string;

  // Scene elements
  @Column({ type: 'varchar', length: 100 })
  industry: string;

  @Column({ type: 'varchar', length: 100 })
  region: string;

  @Column({ type: 'varchar', length: 100, name: 'user_type' })
  userType: string;

  @Column({ type: 'simple-array', name: 'special_requirements' })
  specialRequirements: string[];

  // Five-dimensional tag selection
  @Column({ type: 'simple-json', name: 'selected_tags' })
  selectedTags: {
    objects: string[];
    subjects: string[];
    lifecycles: string[];
    securities: string[];
    actions: string[];
  };

  // COU references
  @Column({ type: 'simple-json', name: 'cou_references' })
  couReferences: Array<{
    couId: string;
    versionId: string;
    isLatest: boolean;
    updateAvailable: boolean;
    autoUpgrade: boolean;
    pinnedWeight?: number;
  }>;

  @Column({ type: 'simple-array' })
  cous: string[]; // COU IDs for backward compatibility

  @Column({ type: 'int', name: 'total_cous' })
  totalCOUs: number;

  // Matching config
  @Column({ type: 'simple-json', name: 'matching_config' })
  matchingConfig: {
    minMatchScore: number;
    boostForActionTags: boolean;
    requireAllActionTags: boolean;
    includeRelatedTags: boolean;
    includeHierarchy: boolean;
  };

  // Weight analysis
  @Column({ type: 'decimal', precision: 6, scale: 2, name: 'total_weight' })
  totalWeight: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, name: 'average_weight' })
  averageWeight: number;

  @Column({ type: 'int', name: 'high_priority_cous' })
  highPriorityCOUs: number;

  // Compliance score
  @Column({ type: 'decimal', precision: 5, scale: 2, name: 'compliance_score' })
  complianceScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  completeness: number;

  // Tag distribution
  @Column({ type: 'simple-json', name: 'tag_distribution' })
  tagDistribution: Record<string, number>;

  // Version and status
  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'archived'],
    default: 'draft',
  })
  status: SceneStatus;

  @Column({ type: 'boolean', name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ type: 'uuid', name: 'based_on_template', nullable: true })
  basedOnTemplate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('scene_templates')
export class SceneTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  icon: string;

  @Column({
    type: 'enum',
    enum: ['出海合规', '行业合规', '业务合规', '技术合规'],
  })
  category: SceneCategory;

  // Target elements
  @Column({ type: 'simple-array', name: 'target_industries' })
  targetIndustries: string[];

  @Column({ type: 'simple-array', name: 'target_regions' })
  targetRegions: string[];

  @Column({ type: 'simple-array', name: 'target_user_types' })
  targetUserTypes: string[];

  // Tag profile
  @Column({ type: 'simple-json', name: 'tag_profile' })
  tagProfile: {
    requiredTags: string[];
    preferredTags: string[];
    excludedTags: string[];
    tagWeights: Record<string, number>;
    tagCoefficients: Record<string, number>;
  };

  // Matching config
  @Column({ type: 'simple-json', name: 'matching_config' })
  matchingConfig: {
    minMatchScore: number;
    boostForActionTags: boolean;
    requireAllActionTags: boolean;
    includeRelatedTags: boolean;
    includeHierarchy: boolean;
  };

  // Legacy tags (backward compatibility)
  @Column({ type: 'simple-array', name: 'required_tags' })
  requiredTags: string[];

  @Column({ type: 'simple-array', name: 'optional_tags' })
  optionalTags: string[];

  // Recommended COUs
  @Column({ type: 'simple-array', name: 'recommended_cous' })
  recommendedCOUs: string[];

  // Usage stats
  @Column({ type: 'int', default: 0, name: 'usage_count' })
  usageCount: number;

  @Column({ type: 'boolean', name: 'is_popular', default: false })
  isPopular: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
