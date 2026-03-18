import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { UserSettingsService, UserSettings, UserActivity } from './user-settings.service';
import {
  UpdateUserSettingsDto,
  ChangePasswordDto,
  UserProfileDto,
  UserActivityQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../../entities';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    organizationId: string;
  };
}

@ApiTags('用户设置')
@Controller('user-settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserSettingsController {
  constructor(private readonly userSettingsService: UserSettingsService) {}

  // ==================== 用户设置 ====================

  @Get()
  @ApiOperation({ summary: '获取用户设置' })
  @ApiResponse({ status: 200, description: '返回用户设置' })
  async getSettings(@Request() req: RequestWithUser): Promise<UserSettings> {
    return this.userSettingsService.getSettings(req.user.userId);
  }

  @Put()
  @ApiOperation({ summary: '更新用户设置' })
  @ApiResponse({ status: 200, description: '设置更新成功' })
  async updateSettings(
    @Body() updateDto: UpdateUserSettingsDto,
    @Request() req: RequestWithUser,
  ): Promise<UserSettings> {
    return this.userSettingsService.updateSettings(req.user.userId, updateDto);
  }

  @Post('reset')
  @ApiOperation({ summary: '重置用户设置为默认值' })
  @ApiResponse({ status: 200, description: '设置重置成功' })
  async resetSettings(@Request() req: RequestWithUser): Promise<UserSettings> {
    return this.userSettingsService.resetSettings(req.user.userId);
  }

  // ==================== 用户资料 ====================

  @Get('profile')
  @ApiOperation({ summary: '获取用户资料' })
  @ApiResponse({ status: 200, description: '返回用户资料', type: User })
  async getProfile(@Request() req: RequestWithUser): Promise<Partial<User>> {
    return this.userSettingsService.getProfile(req.user.userId);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户资料' })
  @ApiResponse({ status: 200, description: '资料更新成功' })
  async updateProfile(
    @Body() profileDto: UserProfileDto,
    @Request() req: RequestWithUser,
  ): Promise<Partial<User>> {
    return this.userSettingsService.updateProfile(req.user.userId, profileDto);
  }

  // ==================== 密码管理 ====================

  @Put('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '修改密码' })
  @ApiResponse({ status: 204, description: '密码修改成功' })
  @ApiResponse({ status: 401, description: '当前密码错误' })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    return this.userSettingsService.changePassword(req.user.userId, changePasswordDto);
  }

  // ==================== 用户活动日志 ====================

  @Get('activities')
  @ApiOperation({ summary: '获取用户活动日志' })
  @ApiResponse({ status: 200, description: '返回用户活动日志' })
  async getActivities(
    @Query() query: UserActivityQueryDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    items: UserActivity[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.userSettingsService.getActivities(req.user.userId, {
      page: query.page,
      limit: query.limit,
      type: query.type,
      startDate: query.startDate,
      endDate: query.endDate,
    });
  }

  @Get('activities/stats')
  @ApiOperation({ summary: '获取用户活动统计' })
  @ApiResponse({ status: 200, description: '返回用户活动统计' })
  async getActivityStats(
    @Request() req: RequestWithUser,
  ): Promise<{
    total: number;
    byType: Record<string, number>;
    byResourceType: Record<string, number>;
    recent7Days: number;
  }> {
    return this.userSettingsService.getActivityStats(req.user.userId);
  }
}
