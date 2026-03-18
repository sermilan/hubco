import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Clause } from './clause.entity';
import { COU } from './cou.entity';

export type PolicyLevel =
  | '法律'
  | '行政法规'
  | '部门规章'
  | '国家标准'
  | '行业标准'
  | '地方性法规'
  | '指南指引';

export const POLICY_LEVEL_WEIGHTS: Record<PolicyLevel, number> = {
  法律: 10,
  行政法规: 9,
  部门规章: 8,
  国家标准: 7,
  行业标准: 6,
  地方性法规: 5,
  指南指引: 4,
};

@Entity('policies')
@Index(['code'], { unique: true })
@Index(['level'])
export class Policy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // 文号

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
  level: PolicyLevel;

  @Column({ type: 'simple-array' })
  industries: string[];

  @Column({ type: 'simple-array' })
  regions: string[];

  @Column({ type: 'varchar', length: 255, name: 'publish_org' })
  publishOrg: string;

  // Version management
  @Column({ type: 'simple-json', name: 'current_version' })
  currentVersion: {
    versionId: string;
    versionNumber: string;
    publishDate: string;
    effectiveDate: string;
    expiryDate?: string;
    status: 'draft' | 'current' | 'superseded' | 'deprecated';
    changeLog?: string;
    replacedBy?: string;
    replaces?: string;
  };

  @Column({ type: 'simple-json', nullable: true })
  versions: Array<{
    versionId: string;
    versionNumber: string;
    publishDate: string;
    effectiveDate: string;
    expiryDate?: string;
    status: 'draft' | 'current' | 'superseded' | 'deprecated';
    changeLog?: string;
    replacedBy?: string;
    replaces?: string;
  }>;

  // Basic info
  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  fullText: string;

  @Column({ type: 'varchar', length: 500, name: 'download_url', nullable: true })
  downloadUrl: string;

  // Stats
  @Column({ type: 'int', default: 0, name: 'clause_count' })
  clauseCount: number;

  @Column({ type: 'int', default: 0, name: 'cou_count' })
  couCount: number;

  // Relations
  @Column({ type: 'simple-array', name: 'related_policies', nullable: true })
  relatedPolicies: string[];

  @Column({ type: 'simple-array', nullable: true })
  supersedes: string[];

  @Column({ type: 'varchar', length: 50, name: 'superseded_by', nullable: true })
  supersededBy: string;

  @OneToMany(() => Clause, (clause) => clause.policy)
  clauses: Clause[];

  @OneToMany(() => COU, (cou) => cou.policy)
  cous: COU[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
