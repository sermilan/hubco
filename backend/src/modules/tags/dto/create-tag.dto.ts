import {
  IsString,
  IsOptional,
  IsObject,
  IsArray,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TagCategory, TagDomain } from '../../../entities';

export class CreateTagDto {
  @ApiProperty({ description: '标签代码' })
  @IsString()
  code: string;

  @ApiProperty({ description: '标签名称' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: '标签描述' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '所属维度', enum: ['object', 'subject', 'lifecycle', 'security', 'action'] })
  @IsEnum(['object', 'subject', 'lifecycle', 'security', 'action'] as const)
  domain: TagDomain;

  @ApiProperty({ description: '分类', enum: ['core', 'extended', 'custom'] })
  @IsEnum(['core', 'extended', 'custom'] as const)
  category: TagCategory;

  @ApiPropertyOptional({ description: '父标签ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '层级' })
  @IsOptional()
  @IsNumber()
  level?: number;

  @ApiPropertyOptional({ description: '路径' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: '关联标签', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedTags?: string[];

  @ApiPropertyOptional({ description: '同义词', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  synonyms?: string[];

  @ApiPropertyOptional({ description: '适用场景', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableScenarios?: string[];

  @ApiPropertyOptional({ description: '行业权重', type: 'object', additionalProperties: { type: 'number' } })
  @IsOptional()
  @IsObject()
  industryWeights?: Record<string, number>;

  @ApiPropertyOptional({ description: '元数据', type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
