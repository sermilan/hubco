import {
  Controller,
  Post,
  Body,
  Get,
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
import { AIService } from './ai.service';
import {
  ExtractCOUsDto,
  RecommendTagsDto,
  RecommendSceneDto,
  SummarizeContentDto,
  ComparePoliciesDto,
  ChatQueryDto,
  ExtractedCOU,
  TagRecommendation,
  SceneRecommendation,
  ContentSummary,
  PolicyComparisonResult,
  ChatResponse,
  AIUsageStats,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    organizationId: string;
  };
}

@ApiTags('AI智能服务')
@Controller('ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  // ==================== 服务状态 ====================

  @Get('status')
  @ApiOperation({ summary: '获取AI服务状态' })
  @ApiResponse({ status: 200, description: '返回AI服务状态' })
  async getStatus(): Promise<{
    currentProvider: string;
    availableProviders: { type: string; name: string; available: boolean }[];
  }> {
    const provider = this.aiService.getCurrentProvider();
    const availableProviders = this.aiService.getAvailableProviders();

    return {
      currentProvider: provider.name,
      availableProviders,
    };
  }

  // ==================== COU智能提取 ====================

  @Post('extract-cous')
  @ApiOperation({ summary: '从政策文本智能提取COU' })
  @ApiResponse({ status: 200, description: '成功提取COU列表' })
  async extractCOUs(
    @Body() dto: ExtractCOUsDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    cous: ExtractedCOU[];
    totalTokens: number;
    provider: string;
  }> {
    return this.aiService.extractCOUs(dto, req.user.userId);
  }

  // ==================== 标签推荐 ====================

  @Post('recommend-tags')
  @ApiOperation({ summary: '智能推荐标签' })
  @ApiResponse({ status: 200, description: '返回推荐标签列表' })
  async recommendTags(
    @Body() dto: RecommendTagsDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    tags: TagRecommendation[];
    totalTokens: number;
    provider: string;
  }> {
    return this.aiService.recommendTags(dto, req.user.userId);
  }

  // ==================== 场景推荐 ====================

  @Post('recommend-scenes')
  @ApiOperation({ summary: '根据描述推荐场景模板' })
  @ApiResponse({ status: 200, description: '返回推荐场景列表' })
  async recommendScenes(
    @Body() dto: RecommendSceneDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    scenes: SceneRecommendation[];
    totalTokens: number;
    provider: string;
  }> {
    return this.aiService.recommendScenes(dto, req.user.userId);
  }

  // ==================== 内容摘要 ====================

  @Post('summarize')
  @ApiOperation({ summary: '生成内容摘要' })
  @ApiResponse({ status: 200, description: '返回内容摘要' })
  async summarizeContent(
    @Body() dto: SummarizeContentDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    summary: ContentSummary;
    totalTokens: number;
    provider: string;
  }> {
    return this.aiService.summarizeContent(dto, req.user.userId);
  }

  // ==================== 政策对比 ====================

  @Post('compare-policies')
  @ApiOperation({ summary: '对比多个政策' })
  @ApiResponse({ status: 200, description: '返回政策对比结果' })
  async comparePolicies(
    @Body() dto: ComparePoliciesDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    results: PolicyComparisonResult[];
    totalTokens: number;
    provider: string;
  }> {
    return this.aiService.comparePolicies(dto, req.user.userId);
  }

  // ==================== 智能问答 ====================

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'AI智能问答' })
  @ApiResponse({ status: 200, description: '返回AI回答' })
  async chat(
    @Body() dto: ChatQueryDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    response: ChatResponse;
    totalTokens: number;
    provider: string;
  }> {
    return this.aiService.chat(dto, req.user.userId);
  }

  // ==================== 使用统计 ====================

  @Get('usage-stats')
  @ApiOperation({ summary: '获取AI服务使用统计' })
  @ApiResponse({ status: 200, description: '返回使用统计数据' })
  async getUsageStats(
    @Request() req: RequestWithUser,
  ): Promise<AIUsageStats & { byProvider: Record<string, number> }> {
    return this.aiService.getUsageStats(req.user.userId, req.user.organizationId);
  }
}
