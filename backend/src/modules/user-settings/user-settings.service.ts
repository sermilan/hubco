import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../entities/user.entity';
import {
  UpdateUserSettingsDto,
  ChangePasswordDto,
  UserProfileDto,
  NotificationSettingsDto,
  InterfaceSettingsDto,
  SearchPreferencesDto,
} from './dto';

export interface UserSettings {
  notifications: NotificationSettingsDto;
  interface: InterfaceSettingsDto;
  search: SearchPreferencesDto;
  defaultIndustry?: string;
  defaultRegion?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'search' | 'view' | 'export' | 'create' | 'update' | 'delete';
  resourceType: 'policy' | 'cou' | 'scene' | 'tag';
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

@Injectable()
export class UserSettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ==================== 用户设置 CRUD ====================

  async getSettings(userId: string): Promise<UserSettings> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'preferences'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mergeWithDefaults((user.preferences || {}) as unknown as UserSettings);
  }

  async updateSettings(
    userId: string,
    updateDto: UpdateUserSettingsDto,
  ): Promise<UserSettings> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentSettings = ((user.preferences || {}) as unknown as UserSettings) || {};

    // 合并新设置
    const newSettings: UserSettings = {
      notifications: updateDto.notifications
        ? { ...currentSettings.notifications, ...updateDto.notifications }
        : currentSettings.notifications,
      interface: updateDto.interface
        ? { ...currentSettings.interface, ...updateDto.interface }
        : currentSettings.interface,
      search: updateDto.search
        ? { ...currentSettings.search, ...updateDto.search }
        : currentSettings.search,
      defaultIndustry: updateDto.defaultIndustry ?? currentSettings.defaultIndustry,
      defaultRegion: updateDto.defaultRegion ?? currentSettings.defaultRegion,
    };

    user.preferences = newSettings as unknown as User['preferences'];
    await this.userRepository.save(user);

    return this.mergeWithDefaults(newSettings);
  }

  async resetSettings(userId: string): Promise<UserSettings> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.preferences = {} as unknown as User['preferences'];
    await this.userRepository.save(user);

    return this.getDefaultSettings();
  }

  // ==================== 用户资料 ====================

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name', 'avatar', 'role', 'lastLoginAt', 'createdAt'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    profileDto: UserProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (profileDto.name) {
      user.name = profileDto.name;
    }
    if (profileDto.avatar !== undefined) {
      user.avatar = profileDto.avatar;
    }

    await this.userRepository.save(user);
    return this.getProfile(userId);
  }

  // ==================== 密码管理 ====================

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // 哈希新密码
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedNewPassword;

    await this.userRepository.save(user);
  }

  // ==================== 用户活动日志 ====================

  private activities: UserActivity[] = []; // 内存存储，生产环境应使用数据库

  async logActivity(
    userId: string,
    type: UserActivity['type'],
    resourceType: UserActivity['resourceType'],
    resourceId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const activity: UserActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      resourceType,
      resourceId,
      details,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    };

    this.activities.push(activity);

    // 限制内存中的日志数量（最近10000条）
    if (this.activities.length > 10000) {
      this.activities = this.activities.slice(-10000);
    }
  }

  async getActivities(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      type?: string;
      startDate?: string;
      endDate?: string;
    } = {},
  ): Promise<{
    items: UserActivity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, type, startDate, endDate } = options;

    let filtered = this.activities.filter((a) => a.userId === userId);

    if (type) {
      filtered = filtered.filter((a) => a.type === type);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((a) => a.createdAt >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      filtered = filtered.filter((a) => a.createdAt <= end);
    }

    // 按时间倒序排列
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const items = filtered.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async getActivityStats(userId: string): Promise<{
    total: number;
    byType: Record<string, number>;
    byResourceType: Record<string, number>;
    recent7Days: number;
  }> {
    const userActivities = this.activities.filter((a) => a.userId === userId);
    const recent7Days = new Date();
    recent7Days.setDate(recent7Days.getDate() - 7);

    const byType: Record<string, number> = {};
    const byResourceType: Record<string, number> = {};

    userActivities.forEach((activity) => {
      byType[activity.type] = (byType[activity.type] || 0) + 1;
      byResourceType[activity.resourceType] =
        (byResourceType[activity.resourceType] || 0) + 1;
    });

    return {
      total: userActivities.length,
      byType,
      byResourceType,
      recent7Days: userActivities.filter((a) => a.createdAt >= recent7Days).length,
    };
  }

  // ==================== 默认设置 ====================

  private getDefaultSettings(): UserSettings {
    return {
      notifications: {
        email: true,
        system: true,
        policyUpdate: true,
        couUpdate: true,
        weeklyReport: false,
        monthlyDigest: true,
      },
      interface: {
        theme: 'system',
        language: 'zh-CN',
        density: 'normal',
        sidebarExpanded: true,
        defaultPage: 'dashboard',
      },
      search: {
        defaultFilters: {},
        pageSize: 20,
        saveHistory: true,
      },
      defaultIndustry: undefined,
      defaultRegion: undefined,
    };
  }

  private mergeWithDefaults(settings: UserSettings | null | undefined): UserSettings {
    const defaults = this.getDefaultSettings();

    if (!settings) {
      return defaults;
    }

    return {
      notifications: { ...defaults.notifications, ...settings.notifications },
      interface: { ...defaults.interface, ...settings.interface },
      search: { ...defaults.search, ...settings.search },
      defaultIndustry: settings.defaultIndustry ?? defaults.defaultIndustry,
      defaultRegion: settings.defaultRegion ?? defaults.defaultRegion,
    };
  }
}
