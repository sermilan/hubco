import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SceneCategory } from '../../../entities';

class TagProfileDto {
  @ApiProperty({ description: '必需标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  requiredTags: string[];

  @ApiProperty({ description: '优先标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  preferredTags: string[];

  @ApiProperty({ description: '排除标签', type: [String] })
  @IsArray()
  @IsString({ each: true })
  excludedTags: string[];

  @ApiProperty({ description: '标签权重', type: 'object', additionalProperties: { type: 'number' } })
  @IsObject()
  tagWeights: Record<string, number>;

  @ApiProperty({ description: '标签系数', type: 'object', additionalProperties: { type: 'number' } })
  @IsObject()
  tagCoefficients: Record<string, number>;
}

class MatchingConfigDto {
  @ApiProperty({ description: '最小匹配分数', minimum: 0, maximum: 1 })
  @IsNumber()
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

export class CreateSceneTemplateDto {
  @ApiProperty({ description: '模板名称' })
  @IsString()
  name: string;

  @ApiProperty({ description: '模板描述' })
  @IsString()
  description: string;

  @ApiProperty({ description: '图标' })
  @IsString()
  icon: string;

  @ApiProperty({ description: '分类', enum: ['出海合规', '行业合规', '业务合规', '技术合规'] })
  @IsEnum(['出海合规', '行业合规', '业务合规', '技术合规'] as const)
  category: SceneCategory;

  @ApiProperty({ description: '目标行业', type: [String] })
  @IsArray()
  @IsString({ each: true })
  targetIndustries: string[];

  @ApiProperty({ description: '目标地区', type: [String] })
  @IsArray()
  @IsString({ each: true })
  targetRegions: string[];

  @ApiProperty({ description: '目标用户类型', type: [String] })
  @IsArray()
  @IsString({ each: true })
  targetUserTypes: string[];

  @ApiProperty({ description: '标签配置' })
  @IsObject()
  tagProfile: TagProfileDto;

  @ApiProperty({ description: '匹配配置' })
  @IsObject()
  matchingConfig: MatchingConfigDto;

  @ApiPropertyOptional({ description: '必需标签（向后兼容）', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTags?: string[];

  @ApiPropertyOptional({ description: '可选标签（向后兼容）', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  optionalTags?: string[];

  @ApiPropertyOptional({ description: '推荐的COU', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedCOUs?: string[];
}
