import {
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
  IsArray,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SceneStatus } from '../../../entities';

class MatchingConfigDto {
  @ApiProperty({ description: '最小匹配分数', minimum: 0, maximum: 1 })
  @IsNumber()
  @Min(0)
  @Max(1)
  minMatchScore: number;

  @ApiProperty({ description: '是否对动作标签加权' })
  @IsBoolean()
  boostForActionTags: boolean;

  @ApiProperty({ description: '是否要求所有动作标签' })
  @IsBoolean()
  requireAllActionTags: boolean;

  @ApiProperty({ description: '是否包含相关标签' })
  @IsBoolean()
  includeRelatedTags: boolean;

  @ApiProperty({ description: '是否包含层级关系' })
  @IsBoolean()
  includeHierarchy: boolean;
}

class SelectedTagsDto {
  @ApiProperty({ description: '对象标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  objects: string[];

  @ApiProperty({ description: '主体标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  subjects: string[];

  @ApiProperty({ description: '生命周期标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  lifecycles: string[];

  @ApiProperty({ description: '安全标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  securities: string[];

  @ApiProperty({ description: '动作标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  actions: string[];
}

class CouReferenceDto {
  @ApiProperty({ description: 'COU ID' })
  @IsUUID()
  couId: string;

  @ApiProperty({ description: '版本ID' })
  @IsUUID()
  versionId: string;

  @ApiProperty({ description: '是否最新版本' })
  @IsBoolean()
  isLatest: boolean;

  @ApiProperty({ description: '是否有更新可用' })
  @IsBoolean()
  updateAvailable: boolean;

  @ApiProperty({ description: '是否自动升级' })
  @IsBoolean()
  autoUpgrade: boolean;

  @ApiPropertyOptional({ description: '固定权重' })
  @IsOptional()
  @IsNumber()
  pinnedWeight?: number;
}

export class CreateSceneDto {
  @ApiProperty({ description: '场景名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '场景描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '行业' })
  @IsString()
  industry: string;

  @ApiProperty({ description: '地区' })
  @IsString()
  region: string;

  @ApiProperty({ description: '用户类型' })
  @IsString()
  userType: string;

  @ApiProperty({ description: '特殊要求', type: [String] })
  @IsArray()
  @IsString({ each: true })
  specialRequirements: string[];

  @ApiProperty({ description: '选中的五维标签' })
  @IsObject()
  selectedTags: SelectedTagsDto;

  @ApiProperty({ description: 'COU引用', type: [CouReferenceDto] })
  @IsArray()
  couReferences: CouReferenceDto[];

  @ApiProperty({ description: 'COU IDs（向后兼容）', type: [String] })
  @IsArray()
  @IsString({ each: true })
  cous: string[];

  @ApiProperty({ description: '匹配配置' })
  @IsObject()
  matchingConfig: MatchingConfigDto;

  @ApiPropertyOptional({ description: '基于的模板ID' })
  @IsOptional()
  @IsUUID()
  basedOnTemplate?: string;

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'active', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'archived'] as const)
  status?: SceneStatus;

  @ApiPropertyOptional({ description: '是否公开' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
