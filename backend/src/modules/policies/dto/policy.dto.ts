import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Policy } from '../../../entities/policy.entity';
import type { PolicyLevel } from '../../../entities/policy.entity';

class PolicyVersionDto {
  @ApiProperty({ example: 'v1.0' })
  @IsString()
  versionId: string;

  @ApiProperty({ example: '1.0' })
  @IsString()
  versionNumber: string;

  @ApiProperty({ example: '2021-06-10' })
  @IsString()
  publishDate: string;

  @ApiProperty({ example: '2021-09-01' })
  @IsString()
  effectiveDate: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiProperty({ enum: ['draft', 'current', 'superseded', 'deprecated'], example: 'current' })
  @IsEnum(['draft', 'current', 'superseded', 'deprecated'])
  status: 'draft' | 'current' | 'superseded' | 'deprecated';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  changeLog?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  replacedBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  replaces?: string;
}

export class CreatePolicyDto {
  @ApiProperty({ example: '数据安全法' })
  @IsString()
  title: string;

  @ApiProperty({ example: '主席令第84号' })
  @IsString()
  code: string;

  @ApiProperty({ enum: ['法律', '行政法规', '部门规章', '国家标准', '行业标准', '地方性法规', '指南指引'] })
  @IsEnum(['法律', '行政法规', '部门规章', '国家标准', '行业标准', '地方性法规', '指南指引'])
  level: PolicyLevel;

  @ApiProperty({ example: ['通用', '互联网', '金融'] })
  @IsArray()
  @IsString({ each: true })
  industries: string[];

  @ApiProperty({ example: ['国内'] })
  @IsArray()
  @IsString({ each: true })
  regions: string[];

  @ApiProperty({ example: '全国人大常委会' })
  @IsString()
  publishOrg: string;

  @ApiProperty({
    type: PolicyVersionDto,
    example: {
      versionId: 'v1.0',
      versionNumber: '1.0',
      publishDate: '2021-06-10',
      effectiveDate: '2021-09-01',
      status: 'current',
    },
  })
  @ValidateNested()
  @Type(() => PolicyVersionDto)
  currentVersion: PolicyVersionDto;

  @ApiPropertyOptional({ type: [PolicyVersionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PolicyVersionDto)
  versions?: PolicyVersionDto[];

  @ApiProperty({ example: '数据安全法是我国数据安全领域的基础性法律...' })
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  downloadUrl?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedPolicies?: string[];
}

export class UpdatePolicyDto extends CreatePolicyDto {}

export class PolicyFilterDto {
  @ApiPropertyOptional({ example: '数据安全' })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  levels?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  industries?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

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

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'DESC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export interface PolicyResponse {
  items: Policy[];
  total: number;
  page: number;
  limit: number;
}
