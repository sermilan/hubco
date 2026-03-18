import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Policy, COU, User, Organization, Scene, Tag } from '../../entities';

export interface SystemOverviewStats {
  totalPolicies: number;
  totalCOUs: number;
  totalUsers: number;
  totalOrganizations: number;
  totalScenes: number;
  totalTags: number;
  policiesByLevel: Record<string, number>;
  cousByStatus: Record<string, number>;
  usersByRole: Record<string, number>;
  recentGrowth: {
    policies: { current: number; previous: number; growthRate: number };
    cous: { current: number; previous: number; growthRate: number };
    users: { current: number; previous: number; growthRate: number };
  };
}

export interface TrendData {
  date: string;
  policies: number;
  cous: number;
  users: number;
  searches: number;
  pageViews: number;
}

export interface PopularContent {
  id: string;
  title: string;
  views: number;
  uniqueVisitors: number;
  avgTimeSpent: number;
  lastViewedAt: Date;
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueSearchers: number;
  avgResultsPerSearch: number;
  topKeywords: { keyword: string; count: number }[];
  searchTrend: { date: string; count: number }[];
  filterUsage: Record<string, number>;
}

export interface UserBehaviorStats {
  activeUsers: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  avgSessionDuration: number;
  bounceRate: number;
  pagesPerSession: number;
  topFeatures: { feature: string; usage: number }[];
  userRetention: { date: string; rate: number }[];
}

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    @InjectRepository(COU)
    private couRepository: Repository<COU>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @InjectRepository(Scene)
    private sceneRepository: Repository<Scene>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  // ==================== 系统概览统计 ====================

  async getSystemOverview(
    startDate?: string,
    endDate?: string,
  ): Promise<SystemOverviewStats> {
    const where = this.buildDateFilter(startDate, endDate);

    // 基础统计
    const [
      totalPolicies,
      totalCOUs,
      totalUsers,
      totalOrganizations,
      totalScenes,
      totalTags,
    ] = await Promise.all([
      this.policyRepository.count({ where }),
      this.couRepository.count({ where }),
      this.userRepository.count(),
      this.organizationRepository.count(),
      this.sceneRepository.count(),
      this.tagRepository.count(),
    ]);

    // 按级别/状态分布
    const [policiesByLevel, cousByStatus, usersByRole] = await Promise.all([
      this.getPoliciesByLevel(where),
      this.getCOUsByStatus(where),
      this.getUsersByRole(),
    ]);

    // 增长统计（最近30天 vs 前30天）
    const recentGrowth = await this.calculateRecentGrowth();

    return {
      totalPolicies,
      totalCOUs,
      totalUsers,
      totalOrganizations,
      totalScenes,
      totalTags,
      policiesByLevel,
      cousByStatus,
      usersByRole,
      recentGrowth,
    };
  }

  // ==================== 趋势分析 ====================

  async getTrendData(
    granularity: 'day' | 'week' | 'month' = 'day',
    days: number = 30,
  ): Promise<TrendData[]> {
    const data: TrendData[] = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // 生成日期序列
    const dates = this.generateDateRange(startDate, endDate, granularity);

    for (const date of dates) {
      const dateStr = date.toISOString().split('T')[0];

      // 查询该日期之前的数据量（累计）
      const [policies, cous, users] = await Promise.all([
        this.policyRepository.count({
          where: { createdAt: Between(startDate, date) },
        }),
        this.couRepository.count({
          where: { createdAt: Between(startDate, date) },
        }),
        this.userRepository.count({
          where: { createdAt: Between(startDate, date) },
        }),
      ]);

      data.push({
        date: dateStr,
        policies,
        cous,
        users,
        searches: Math.floor(Math.random() * 1000) + 100, // 模拟数据
        pageViews: Math.floor(Math.random() * 5000) + 500,
      });
    }

    return data;
  }

  // ==================== 热门内容统计 ====================

  async getPopularContent(
    type?: 'policy' | 'cou' | 'scene',
    limit: number = 10,
  ): Promise<PopularContent[]> {
    // 模拟热门内容数据，实际应该基于访问日志
    const mockData: PopularContent[] = [
      {
        id: '1',
        title: '数据安全法',
        views: 15420,
        uniqueVisitors: 5230,
        avgTimeSpent: 245,
        lastViewedAt: new Date(),
      },
      {
        id: '2',
        title: '个人信息保护法',
        views: 12890,
        uniqueVisitors: 4120,
        avgTimeSpent: 198,
        lastViewedAt: new Date(),
      },
      {
        id: '3',
        title: '网络安全等级保护条例',
        views: 9870,
        uniqueVisitors: 3450,
        avgTimeSpent: 312,
        lastViewedAt: new Date(),
      },
    ];

    return mockData.slice(0, limit);
  }

  // ==================== 搜索分析 ====================

  async getSearchAnalytics(
    startDate?: string,
    endDate?: string,
    topKeywordsLimit: number = 20,
  ): Promise<SearchAnalytics> {
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // 模拟搜索统计数据
    const totalSearches = 45680;
    const uniqueSearchers = 3240;
    const avgResultsPerSearch = 12.5;

    // 热门搜索词
    const topKeywords = [
      { keyword: '数据安全', count: 3456 },
      { keyword: '个人信息保护', count: 2890 },
      { keyword: '等保2.0', count: 2345 },
      { keyword: '数据出境', count: 1987 },
      { keyword: '隐私计算', count: 1654 },
      { keyword: '数据分类分级', count: 1432 },
      { keyword: 'GDPR', count: 1234 },
      { keyword: '数据脱敏', count: 1123 },
      { keyword: '安全评估', count: 987 },
      { keyword: '数据泄露', count: 876 },
    ].slice(0, topKeywordsLimit);

    // 搜索趋势（最近30天）
    const searchTrend: { date: string; count: number }[] = [];
    const end = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(end);
      date.setDate(date.getDate() - i);
      searchTrend.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 2000) + 500,
      });
    }

    // 筛选器使用统计
    const filterUsage = {
      level: 4520,
      industry: 3890,
      dateRange: 2156,
      tags: 1876,
      region: 1234,
    };

    return {
      totalSearches,
      uniqueSearchers,
      avgResultsPerSearch,
      topKeywords,
      searchTrend,
      filterUsage,
    };
  }

  // ==================== 用户行为分析 ====================

  async getUserBehaviorStats(
    startDate?: string,
    endDate?: string,
    organizationId?: string,
  ): Promise<UserBehaviorStats> {
    // 活跃用户统计
    const activeUsers = {
      daily: Math.floor(Math.random() * 500) + 100,
      weekly: Math.floor(Math.random() * 2000) + 500,
      monthly: Math.floor(Math.random() * 5000) + 2000,
    };

    // 会话统计（模拟数据）
    const avgSessionDuration = 8.5 * 60; // 8.5分钟，单位秒
    const bounceRate = 0.32;
    const pagesPerSession = 4.8;

    // 热门功能使用
    const topFeatures = [
      { feature: '政策搜索', usage: 15420 },
      { feature: 'COU浏览', usage: 12340 },
      { feature: '场景构建', usage: 8760 },
      { feature: '标签筛选', usage: 6540 },
      { feature: '数据导出', usage: 4320 },
      { feature: 'API调用', usage: 3210 },
    ];

    // 用户留存率（最近30天）
    const userRetention: { date: string; rate: number }[] = [];
    const end = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(end);
      date.setDate(date.getDate() - i);
      userRetention.push({
        date: date.toISOString().split('T')[0],
        rate: Math.random() * 0.3 + 0.6, // 60%-90%
      });
    }

    return {
      activeUsers,
      avgSessionDuration,
      bounceRate,
      pagesPerSession,
      topFeatures,
      userRetention,
    };
  }

  // ==================== 组织统计 ====================

  async getOrganizationStats(organizationId: string): Promise<{
    totalScenes: number;
    totalApiCalls: number;
    storageUsed: number;
    memberCount: number;
    usageTrend: { date: string; apiCalls: number }[];
    topUsedFeatures: { feature: string; count: number }[];
  }> {
    const org = await this.organizationRepository.findOne({
      where: { id: organizationId },
    });

    if (!org) {
      return {
        totalScenes: 0,
        totalApiCalls: 0,
        storageUsed: 0,
        memberCount: 0,
        usageTrend: [],
        topUsedFeatures: [],
      };
    }

    // 统计组织成员
    const memberCount = await this.userRepository.count({
      where: { organizationId },
    });

    // 统计组织场景
    const totalScenes = await this.sceneRepository.count({
      where: { organizationId },
    });

    // 模拟API调用数据
    const totalApiCalls = Math.floor(Math.random() * 50000) + 1000;
    const storageUsed = Math.floor(Math.random() * 1000) + 100; // MB

    // 使用趋势
    const usageTrend: { date: string; apiCalls: number }[] = [];
    const end = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(end);
      date.setDate(date.getDate() - i);
      usageTrend.push({
        date: date.toISOString().split('T')[0],
        apiCalls: Math.floor(Math.random() * 2000) + 100,
      });
    }

    // 热门功能
    const topUsedFeatures = [
      { feature: '场景分析', count: 2340 },
      { feature: 'COU查询', count: 1890 },
      { feature: '政策搜索', count: 1456 },
      { feature: '合规报告', count: 876 },
      { feature: '数据导出', count: 543 },
    ];

    return {
      totalScenes,
      totalApiCalls,
      storageUsed,
      memberCount,
      usageTrend,
      topUsedFeatures,
    };
  }

  // ==================== 辅助方法 ====================

  private buildDateFilter(
    startDate?: string,
    endDate?: string,
  ): Record<string, unknown> | undefined {
    if (!startDate && !endDate) return undefined;

    const filter: Record<string, unknown> = {};
    if (startDate) {
      filter.createdAt = Between(new Date(startDate), endDate ? new Date(endDate) : new Date());
    }
    return filter;
  }

  private async getPoliciesByLevel(
    where?: Record<string, unknown>,
  ): Promise<Record<string, number>> {
    const query = this.policyRepository.createQueryBuilder('policy');
    if (where) {
      query.where(where);
    }
    const result = await query
      .select('policy.level', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('policy.level')
      .getRawMany();

    return result.reduce((acc, curr) => {
      acc[curr.level] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }

  private async getCOUsByStatus(
    where?: Record<string, unknown>,
  ): Promise<Record<string, number>> {
    const query = this.couRepository.createQueryBuilder('cou');
    if (where) {
      query.where(where);
    }
    const result = await query
      .select('cou.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('cou.status')
      .getRawMany();

    return result.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }

  private async getUsersByRole(): Promise<Record<string, number>> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    return result.reduce((acc, curr) => {
      acc[curr.role] = parseInt(curr.count, 10);
      return acc;
    }, {});
  }

  private async calculateRecentGrowth(): Promise<
    SystemOverviewStats['recentGrowth']
  > {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(now.getDate() - 60);

    const [
      currentPolicies,
      previousPolicies,
      currentCOUs,
      previousCOUs,
      currentUsers,
      previousUsers,
    ] = await Promise.all([
      this.policyRepository.count({
        where: { createdAt: Between(thirtyDaysAgo, now) },
      }),
      this.policyRepository.count({
        where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) },
      }),
      this.couRepository.count({
        where: { createdAt: Between(thirtyDaysAgo, now) },
      }),
      this.couRepository.count({
        where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(thirtyDaysAgo, now) },
      }),
      this.userRepository.count({
        where: { createdAt: Between(sixtyDaysAgo, thirtyDaysAgo) },
      }),
    ]);

    const calculateGrowthRate = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(2));
    };

    return {
      policies: {
        current: currentPolicies,
        previous: previousPolicies,
        growthRate: calculateGrowthRate(currentPolicies, previousPolicies),
      },
      cous: {
        current: currentCOUs,
        previous: previousCOUs,
        growthRate: calculateGrowthRate(currentCOUs, previousCOUs),
      },
      users: {
        current: currentUsers,
        previous: previousUsers,
        growthRate: calculateGrowthRate(currentUsers, previousUsers),
      },
    };
  }

  private generateDateRange(
    start: Date,
    end: Date,
    granularity: 'day' | 'week' | 'month',
  ): Date[] {
    const dates: Date[] = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(new Date(current));

      switch (granularity) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return dates;
  }
}
