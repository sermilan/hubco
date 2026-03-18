import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import type { TagCategory, TagDomain } from '../../../entities';

export class TagQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: '每页数量', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: '所属维度', enum: ['object', 'subject', 'lifecycle', 'security', 'action'] })
  @IsOptional()
  @IsEnum(['object', 'subject', 'lifecycle', 'security', 'action'] as const)
  domain?: TagDomain;

  @ApiPropertyOptional({ description: '分类', enum: ['core', 'extended', 'custom'] })
  @IsOptional()
  @IsEnum(['core', 'extended', 'custom'] as const)
  category?: TagCategory;

  @ApiPropertyOptional({ description: '父标签ID' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: '排序字段', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: '排序方向', enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'] as const)
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
