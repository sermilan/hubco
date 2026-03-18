import { IsOptional, IsString, IsBoolean, IsEnum, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationSettingsDto {
  @ApiProperty({ description: '邮件通知开关' })
  @IsBoolean()
  email: boolean;

  @ApiProperty({ description: '系统通知开关' })
  @IsBoolean()
  system: boolean;

  @ApiProperty({ description: '政策更新通知' })
  @IsBoolean()
  policyUpdate: boolean;

  @ApiProperty({ description: 'COU更新通知' })
  @IsBoolean()
  couUpdate: boolean;

  @ApiProperty({ description: '周报订阅' })
  @IsBoolean()
  weeklyReport: boolean;

  @ApiProperty({ description: '月度摘要订阅' })
  @IsBoolean()
  monthlyDigest: boolean;
}

export class InterfaceSettingsDto {
  @ApiPropertyOptional({ description: '主题模式', enum: ['light', 'dark', 'system'] })
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @ApiPropertyOptional({ description: '语言设置', enum: ['zh-CN', 'en-US'] })
  @IsOptional()
  @IsEnum(['zh-CN', 'en-US'])
  language?: 'zh-CN' | 'en-US';

  @ApiPropertyOptional({ description: '默认页面密度', enum: ['compact', 'normal', 'comfortable'] })
  @IsOptional()
  @IsEnum(['compact', 'normal', 'comfortable'])
  density?: 'compact' | 'normal' | 'comfortable';

  @ApiPropertyOptional({ description: '侧边栏展开状态' })
  @IsOptional()
  @IsBoolean()
  sidebarExpanded?: boolean;

  @ApiPropertyOptional({ description: '默认首页', enum: ['dashboard', 'policies', 'cous', 'scenes'] })
  @IsOptional()
  @IsEnum(['dashboard', 'policies', 'cous', 'scenes'])
  defaultPage?: 'dashboard' | 'policies' | 'cous' | 'scenes';
}

export class SearchPreferencesDto {
  @ApiPropertyOptional({ description: '默认搜索筛选条件' })
  @IsOptional()
  @IsObject()
  defaultFilters?: {
    policyLevel?: string[];
    industry?: string[];
    dateRange?: { start?: string; end?: string };
  };

  @ApiPropertyOptional({ description: '搜索结果每页数量', default: 20 })
  @IsOptional()
  pageSize?: number;

  @ApiPropertyOptional({ description: '自动保存搜索历史' })
  @IsOptional()
  @IsBoolean()
  saveHistory?: boolean;
}

export class UpdateUserSettingsDto {
  @ApiPropertyOptional({ description: '通知设置' })
  @IsOptional()
  @IsObject()
  notifications?: NotificationSettingsDto;

  @ApiPropertyOptional({ description: '界面设置' })
  @IsOptional()
  @IsObject()
  interface?: InterfaceSettingsDto;

  @ApiPropertyOptional({ description: '搜索偏好' })
  @IsOptional()
  @IsObject()
  search?: SearchPreferencesDto;

  @ApiPropertyOptional({ description: '默认行业' })
  @IsOptional()
  @IsString()
  defaultIndustry?: string;

  @ApiPropertyOptional({ description: '默认区域' })
  @IsOptional()
  @IsString()
  defaultRegion?: string;
}

export class UserActivityQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: '每页数量', default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: '活动类型', enum: ['search', 'view', 'export', 'create', 'update', 'delete'] })
  @IsOptional()
  @IsEnum(['search', 'view', 'export', 'create', 'update', 'delete'])
  type?: string;

  @ApiPropertyOptional({ description: '开始日期' })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期' })
  @IsOptional()
  @IsString()
  endDate?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: '当前密码' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ description: '新密码', minLength: 8 })
  @IsString()
  newPassword: string;
}

export class UserProfileDto {
  @ApiPropertyOptional({ description: '用户名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString()
  avatar?: string;
}
