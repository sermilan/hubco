import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExtractCOUsDto {
  @ApiProperty({ description: '政策文本内容' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: '政策ID（如果已存在）' })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional({ description: '政策标题' })
  @IsOptional()
  @IsString()
  policyTitle?: string;

  @ApiPropertyOptional({ description: '提取模式', enum: ['standard', 'aggressive', 'conservative'], default: 'standard' })
  @IsOptional()
  @IsEnum(['standard', 'aggressive', 'conservative'])
  mode?: 'standard' | 'aggressive' | 'conservative';

  @ApiPropertyOptional({ description: '最大提取数量', default: 50 })
  @IsOptional()
  @IsNumber()
  maxCount?: number;
}

export class RecommendTagsDto {
  @ApiProperty({ description: '内容文本' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: '内容类型', enum: ['policy', 'cou', 'clause', 'scene'] })
  @IsOptional()
  @IsEnum(['policy', 'cou', 'clause', 'scene'])
  contentType?: 'policy' | 'cou' | 'clause' | 'scene';

  @ApiPropertyOptional({ description: '推荐标签数量', default: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: '是否包含现有标签', default: true })
  @IsOptional()
  @IsBoolean()
  includeExisting?: boolean;
}

export class RecommendSceneDto {
  @ApiProperty({ description: '场景描述' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: '行业' })
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional({ description: '区域' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: '用户类型' })
  @IsOptional()
  @IsString()
  userType?: string;

  @ApiPropertyOptional({ description: '推荐数量', default: 5 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class SummarizeContentDto {
  @ApiProperty({ description: '内容文本' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: '摘要长度', enum: ['short', 'medium', 'long'], default: 'medium' })
  @IsOptional()
  @IsEnum(['short', 'medium', 'long'])
  length?: 'short' | 'medium' | 'long';

  @ApiPropertyOptional({ description: '输出格式', enum: ['paragraph', 'bullet', 'structured'], default: 'structured' })
  @IsOptional()
  @IsEnum(['paragraph', 'bullet', 'structured'])
  format?: 'paragraph' | 'bullet' | 'structured';
}

export class ComparePoliciesDto {
  @ApiProperty({ description: '政策ID列表', type: [String] })
  @IsArray()
  @IsString({ each: true })
  policyIds: string[];

  @ApiPropertyOptional({ description: '对比维度', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dimensions?: string[];
}

export class ChatQueryDto {
  @ApiProperty({ description: '用户问题' })
  @IsString()
  query: string;

  @ApiPropertyOptional({ description: '对话上下文ID' })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({ description: '相关上下文ID' })
  @IsOptional()
  @IsString()
  contextId?: string;

  @ApiPropertyOptional({ description: '上下文类型', enum: ['policy', 'cou', 'scene', 'general'] })
  @IsOptional()
  @IsEnum(['policy', 'cou', 'scene', 'general'])
  contextType?: 'policy' | 'cou' | 'scene' | 'general';
}
