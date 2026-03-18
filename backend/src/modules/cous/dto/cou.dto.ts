import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsInt,
  IsUUID,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { COU } from '../../../entities/cou.entity';
import type { ObligationType, PenaltyLevel, ActionPriority } from '../../../entities/cou.entity';

class ActionRequirementDto {
  @ApiProperty()
  @IsString()
  actionCode: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiProperty({ enum: ['critical', 'high', 'medium', 'low'] })
  @IsEnum(['critical', 'high', 'medium', 'low'])
  priority: ActionPriority;

  @ApiProperty()
  @IsString()
  isBlocking: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  checkPoints: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];
}

class FiveDimensionalTagsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  objects: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  subjects: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  lifecycles: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  securities: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}

export class CreateCOUDto {
  @ApiProperty({ example: 'COU-DSL-001' })
  @IsString()
  code: string;

  @ApiProperty({ example: '数据分类分级管理义务' })
  @IsString()
  title: string;

  @ApiProperty({ example: '详细描述合规义务...' })
  @IsString()
  description: string;

  @ApiProperty({ example: 'clause-uuid' })
  @IsUUID()
  sourceClauseId: string;

  @ApiProperty({ example: 'policy-uuid' })
  @IsUUID()
  policyId: string;

  @ApiProperty({ example: '数据安全法' })
  @IsString()
  policyTitle: string;

  @ApiProperty({
    enum: ['法律', '行政法规', '部门规章', '国家标准', '行业标准', '地方性法规', '指南指引'],
  })
  @IsEnum(['法律', '行政法规', '部门规章', '国家标准', '行业标准', '地方性法规', '指南指引'])
  policyLevel: string;

  @ApiProperty({ enum: ['禁止性', '强制性', '推荐性', '指导性'] })
  @IsEnum(['禁止性', '强制性', '推荐性', '指导性'])
  obligationType: ObligationType;

  @ApiProperty({ example: '建立数据分类分级保护制度' })
  @IsString()
  actionRequired: string;

  @ApiPropertyOptional({ example: '90天' })
  @IsOptional()
  @IsString()
  deadline?: string;

  @ApiPropertyOptional({ example: '罚款100万元以下' })
  @IsOptional()
  @IsString()
  penalty?: string;

  @ApiPropertyOptional({ enum: ['刑事', '高额罚款', '中等罚款', '警告整改', '无'] })
  @IsOptional()
  @IsEnum(['刑事', '高额罚款', '中等罚款', '警告整改', '无'])
  penaltyLevel?: PenaltyLevel;

  @ApiProperty({ example: 10 })
  @IsNumber()
  baseWeight: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  penaltyWeight: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  tagMatchScore: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  scenarioWeight: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  finalWeight?: number;

  @ApiProperty({ type: [Object] })
  @IsOptional()
  tags?: Array<{
    id: string;
    name: string;
    color: string;
    category: string;
  }>;

  @ApiProperty({ type: FiveDimensionalTagsDto })
  @ValidateNested()
  @Type(() => FiveDimensionalTagsDto)
  fiveDimensionalTags: {
    objects: string[];
    subjects: string[];
    lifecycles: string[];
    securities: string[];
    actions: string[];
  };

  @ApiPropertyOptional()
  @IsOptional()
  tagWeights?: Record<string, number>;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  autoTags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  autoTagConfidence?: number;

  @ApiProperty({ type: [ActionRequirementDto] })
  @ValidateNested({ each: true })
  @Type(() => ActionRequirementDto)
  actionRequirements: Array<{
    actionCode: string;
    description: string;
    deadline?: string;
    priority: ActionPriority;
    isBlocking: boolean;
    checkPoints: string[];
    deliverables?: string[];
  }>;

  @ApiProperty({ type: [String], example: ['互联网', '金融'] })
  @IsArray()
  @IsString({ each: true })
  applicableIndustries: string[];

  @ApiProperty({ type: [String], example: ['国内'] })
  @IsArray()
  @IsString({ each: true })
  applicableRegions: string[];

  @ApiProperty({ type: [String], example: ['大型企业', '关基运营者'] })
  @IsArray()
  @IsString({ each: true })
  applicableUserTypes: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialRequirements?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technicalMeasures?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  organizationalMeasures?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedCOUs?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependsOn?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conflicts?: string[];

  @ApiProperty({ example: '1.0' })
  @IsString()
  version: string;
}

export class UpdateCOUDto extends CreateCOUDto {}

export class COUFilterDto {
  @ApiPropertyOptional({ example: '数据分类' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  policyId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  obligationTypes?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableIndustries?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableRegions?: string[];

  @ApiPropertyOptional({ type: [Number], example: [5, 10] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  weightRange?: [number, number];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ default: 'finalWeight' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'finalWeight';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export interface COUResponse {
  items: COU[];
  total: number;
  page: number;
  limit: number;
}
