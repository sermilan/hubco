import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { AnalyticsService } from './analytics.service';
import {
  SystemStatsQueryDto,
  TrendQueryDto,
  PopularContentQueryDto,
  SearchAnalyticsQueryDto,
  UserBehaviorQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    organizationId: string;
  };
}

@ApiTags('数据分析')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ==================== 系统概览统计 ====================

  @Get('overview')
  @ApiOperation({ summary: '获取系统概览统计' })
  @ApiResponse({ status: 200, description: '返回系统概览统计数据' })
  async getSystemOverview(@Query() query: SystemStatsQueryDto) {
    return this.analyticsService.getSystemOverview(query.startDate, query.endDate);
  }

  // ==================== 趋势分析 ====================

  @Get('trends')
  @ApiOperation({ summary: '获取数据趋势' })
  @ApiResponse({ status: 200, description: '返回数据趋势' })
  async getTrends(@Query() query: TrendQueryDto) {
    return this.analyticsService.getTrendData(query.granularity, query.days);
  }

  // ==================== 热门内容 ====================

  @Get('popular-content')
  @ApiOperation({ summary: '获取热门内容' })
  @ApiResponse({ status: 200, description: '返回热门访问内容' })
  async getPopularContent(@Query() query: PopularContentQueryDto) {
    return this.analyticsService.getPopularContent(query.type, query.limit);
  }

  // ==================== 搜索分析 ====================

  @Get('search')
  @ApiOperation({ summary: '获取搜索分析数据' })
  @ApiResponse({ status: 200, description: '返回搜索分析数据' })
  async getSearchAnalytics(@Query() query: SearchAnalyticsQueryDto) {
    return this.analyticsService.getSearchAnalytics(
      query.startDate,
      query.endDate,
      query.topKeywordsLimit,
    );
  }

  // ==================== 用户行为分析 ====================

  @Get('user-behavior')
  @ApiOperation({ summary: '获取用户行为统计' })
  @ApiResponse({ status: 200, description: '返回用户行为统计数据' })
  async getUserBehavior(@Query() query: UserBehaviorQueryDto) {
    return this.analyticsService.getUserBehaviorStats(
      query.startDate,
      query.endDate,
      query.organizationId,
    );
  }

  // ==================== 组织统计 ====================

  @Get('organization')
  @ApiOperation({ summary: '获取当前组织统计' })
  @ApiResponse({ status: 200, description: '返回组织统计数据' })
  async getOrganizationStats(@Request() req: RequestWithUser) {
    return this.analyticsService.getOrganizationStats(req.user.organizationId);
  }
}
