import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ImportPoliciesDto {
  @ApiProperty({ description: '导入格式', enum: ['csv', 'json', 'excel'] })
  @IsEnum(['csv', 'json', 'excel'])
  format: 'csv' | 'json' | 'excel';

  @ApiProperty({ description: '文件内容（Base64编码）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '是否跳过验证', default: false })
  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;

  @ApiPropertyOptional({ description: '重复数据处理策略', enum: ['skip', 'update', 'error'], default: 'skip' })
  @IsOptional()
  @IsEnum(['skip', 'update', 'error'])
  duplicateStrategy?: 'skip' | 'update' | 'error';
}

export class ExportPoliciesDto {
  @ApiProperty({ description: '导出格式', enum: ['csv', 'json', 'excel', 'pdf'] })
  @IsEnum(['csv', 'json', 'excel', 'pdf'])
  format: 'csv' | 'json' | 'excel' | 'pdf';

  @ApiPropertyOptional({ description: '政策ID列表（空表示全部）', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  policyIds?: string[];

  @ApiPropertyOptional({ description: '包含条款', default: true })
  @IsOptional()
  @IsBoolean()
  includeClauses?: boolean;

  @ApiPropertyOptional({ description: '包含COU', default: false })
  @IsOptional()
  @IsBoolean()
  includeCOUs?: boolean;

  @ApiPropertyOptional({ description: '筛选条件' })
  @IsOptional()
  @IsObject()
  filters?: {
    level?: string[];
    industry?: string[];
    status?: string[];
    startDate?: string;
    endDate?: string;
  };
}

export class ImportCOUsDto {
  @ApiProperty({ description: '导入格式', enum: ['csv', 'json', 'excel'] })
  @IsEnum(['csv', 'json', 'excel'])
  format: 'csv' | 'json' | 'excel';

  @ApiProperty({ description: '文件内容（Base64编码）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '关联政策ID' })
  @IsOptional()
  @IsString()
  policyId?: string;

  @ApiPropertyOptional({ description: '重复数据处理策略', enum: ['skip', 'update', 'error'], default: 'skip' })
  @IsOptional()
  @IsEnum(['skip', 'update', 'error'])
  duplicateStrategy?: 'skip' | 'update' | 'error';
}

export class ExportCOUsDto {
  @ApiProperty({ description: '导出格式', enum: ['csv', 'json', 'excel'] })
  @IsEnum(['csv', 'json', 'excel'])
  format: 'csv' | 'json' | 'excel';

  @ApiPropertyOptional({ description: 'COU ID列表（空表示全部）', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  couIds?: string[];

  @ApiPropertyOptional({ description: '包含标签', default: true })
  @IsOptional()
  @IsBoolean()
  includeTags?: boolean;

  @ApiPropertyOptional({ description: '包含权重计算', default: true })
  @IsOptional()
  @IsBoolean()
  includeWeights?: boolean;

  @ApiPropertyOptional({ description: '筛选条件' })
  @IsOptional()
  @IsObject()
  filters?: {
    status?: string[];
    obligationType?: string[];
    penaltyLevel?: string[];
    minWeight?: number;
    maxWeight?: number;
  };
}

export class ImportScenesDto {
  @ApiProperty({ description: '导入格式', enum: ['json', 'yaml'] })
  @IsEnum(['json', 'yaml'])
  format: 'json' | 'yaml';

  @ApiProperty({ description: '文件内容（Base64编码）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '作为模板导入', default: false })
  @IsOptional()
  @IsBoolean()
  asTemplate?: boolean;
}

export class ExportScenesDto {
  @ApiProperty({ description: '导出格式', enum: ['json', 'yaml'] })
  @IsEnum(['json', 'yaml'])
  format: 'json' | 'yaml';

  @ApiPropertyOptional({ description: '场景ID列表（空表示全部）', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sceneIds?: string[];

  @ApiPropertyOptional({ description: '包含完整COU详情', default: false })
  @IsOptional()
  @IsBoolean()
  includeFullCOUs?: boolean;
}

export class ImportTagsDto {
  @ApiProperty({ description: '导入格式', enum: ['csv', 'json'] })
  @IsEnum(['csv', 'json'])
  format: 'csv' | 'json';

  @ApiProperty({ description: '文件内容（Base64编码）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '更新已存在标签', default: false })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean;
}

export class ExportTagsDto {
  @ApiProperty({ description: '导出格式', enum: ['csv', 'json'] })
  @IsEnum(['csv', 'json'])
  format: 'csv' | 'json';

  @ApiPropertyOptional({ description: '标签领域筛选', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  domains?: string[];

  @ApiPropertyOptional({ description: '包含使用统计', default: true })
  @IsOptional()
  @IsBoolean()
  includeStats?: boolean;
}

export class BackupDataDto {
  @ApiPropertyOptional({ description: '包含的数据类型', type: [String], default: ['all'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  include?: string[];

  @ApiPropertyOptional({ description: '密码保护（可选）' })
  @IsOptional()
  @IsString()
  password?: string;
}

export class RestoreDataDto {
  @ApiProperty({ description: '备份文件内容（Base64编码）' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: '备份文件密码' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ description: '恢复策略', enum: ['merge', 'replace'], default: 'merge' })
  @IsOptional()
  @IsEnum(['merge', 'replace'])
  strategy?: 'merge' | 'replace';
}

export class ImportResult {
  @ApiProperty({ description: '导入总数' })
  total: number;

  @ApiProperty({ description: '成功数量' })
  success: number;

  @ApiProperty({ description: '失败数量' })
  failed: number;

  @ApiProperty({ description: '跳过数量' })
  skipped: number;

  @ApiProperty({ description: '更新数量' })
  updated: number;

  @ApiProperty({ description: '错误信息', type: [String] })
  errors: string[];

  @ApiProperty({ description: '导入的数据ID列表' })
  importedIds: string[];
}

export class ExportResult {
  @ApiProperty({ description: '导出格式' })
  format: string;

  @ApiProperty({ description: '导出数量' })
  count: number;

  @ApiProperty({ description: '文件内容（Base64编码）' })
  content: string;

  @ApiProperty({ description: '文件名' })
  filename: string;

  @ApiProperty({ description: '文件大小（字节）' })
  size: number;
}
