import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type TagCategory = '法律' | '技术' | '管理' | '行业' | '场景' | 'core' | 'extended' | 'custom';
export type TagDomain = 'object' | 'subject' | 'lifecycle' | 'security' | 'action';

@Entity('tags')
@Index(['code'], { unique: true })
@Index(['category'])
@Index(['domain'])
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // 标签编码，如 OBJ-001, ACT-001

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({
    type: 'enum',
    enum: ['法律', '技术', '管理', '行业', '场景'],
  })
  category: TagCategory;

  @Column({
    type: 'enum',
    enum: ['object', 'subject', 'lifecycle', 'security', 'action'],
    nullable: true,
  })
  domain: TagDomain;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'simple-array', name: 'related_scenes', nullable: true })
  relatedScenes: string[];

  @Column({ type: 'simple-array', name: 'related_tags', nullable: true })
  relatedTags: string[];

  @Column({ type: 'varchar', length: 50, nullable: true })
  parent: string; // 父标签code

  @Column({ type: 'uuid', nullable: true, name: 'parent_id' })
  parentId: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  level: number;

  @Column({ type: 'text', nullable: true })
  path: string;

  @Column({ type: 'int', default: 0, name: 'usage_count' })
  usageCount: number;

  @Column({ type: 'simple-json', nullable: true, name: 'industry_weights' })
  industryWeights: Record<string, number>;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  synonyms: string[];

  @Column({ type: 'simple-array', nullable: true, name: 'applicable_scenarios' })
  applicableScenarios: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
