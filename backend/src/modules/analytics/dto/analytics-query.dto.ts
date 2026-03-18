import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SystemStatsQueryDto {
  @ApiPropertyOptional({ description: '开始日期', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TrendQueryDto {
  @ApiPropertyOptional({ description: '时间粒度', enum: ['day', 'week', 'month'], default: 'day' })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'])
  granularity?: 'day' | 'week' | 'month';

  @ApiPropertyOptional({ description: '统计天数', default: 30 })
  @IsOptional()
  days?: number;
}

export class PopularContentQueryDto {
  @ApiPropertyOptional({ description: '内容类型', enum: ['policy', 'cou', 'scene'] })
  @IsOptional()
  @IsEnum(['policy', 'cou', 'scene'])
  type?: 'policy' | 'cou' | 'scene';

  @ApiPropertyOptional({ description: '返回数量', default: 10 })
  @IsOptional()
  limit?: number;
}

export class SearchAnalyticsQueryDto {
  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '返回热门搜索词数量', default: 20 })
  @IsOptional()
  topKeywordsLimit?: number;
}

export class UserBehaviorQueryDto {
  @ApiPropertyOptional({ description: '用户ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: '组织ID' })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
