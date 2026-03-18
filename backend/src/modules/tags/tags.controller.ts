import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto, TagQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Tag } from '../../entities';
import type { TagDomain } from '../../entities';

@ApiTags('标签管理')
@Controller('tags')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  // ==================== 标签 CRUD ====================

  @Post()
  @ApiOperation({ summary: '创建标签' })
  @ApiResponse({ status: 201, description: '标签创建成功', type: Tag })
  async create(@Body() createTagDto: CreateTagDto): Promise<Tag> {
    return this.tagsService.create(createTagDto);
  }

  @Get()
  @ApiOperation({ summary: '获取标签列表' })
  @ApiResponse({ status: 200, description: '返回标签列表' })
  async findAll(
    @Query() query: TagQueryDto,
  ): Promise<{
    items: Tag[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.tagsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取标签详情' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiResponse({ status: 200, description: '返回标签详情', type: Tag })
  @ApiResponse({ status: 404, description: '标签不存在' })
  async findOne(@Param('id') id: string): Promise<Tag> {
    return this.tagsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiResponse({ status: 200, description: '标签更新成功', type: Tag })
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<Tag> {
    return this.tagsService.update(id, updateTagDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiResponse({ status: 204, description: '标签删除成功' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.tagsService.remove(id);
  }

  // ==================== 批量操作 ====================

  @Post('batch')
  @ApiOperation({ summary: '批量创建标签' })
  @ApiResponse({ status: 201, description: '标签批量创建成功', type: [Tag] })
  async createMany(@Body() dtos: CreateTagDto[]): Promise<Tag[]> {
    return this.tagsService.createMany(dtos);
  }

  @Delete('batch')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '批量删除标签' })
  @ApiResponse({ status: 204, description: '标签批量删除成功' })
  async removeMany(@Body('ids') ids: string[]): Promise<void> {
    return this.tagsService.removeMany(ids);
  }

  // ==================== 五维标签分类 ====================

  @Get('dimensions/all')
  @ApiOperation({ summary: '获取五维标签分类' })
  @ApiResponse({ status: 200, description: '返回五维标签分类' })
  async findAllDomains(): Promise<
    { domain: TagDomain; count: number; tags: Tag[] }[]
  > {
    return this.tagsService.findAllDomains();
  }

  @Get('dimensions/:domain')
  @ApiOperation({ summary: '按维度获取标签' })
  @ApiParam({ name: 'domain', description: '维度', enum: ['object', 'subject', 'lifecycle', 'security', 'action'] })
  @ApiResponse({ status: 200, description: '返回标签列表', type: [Tag] })
  async findByDomain(@Param('domain') domain: TagDomain): Promise<Tag[]> {
    return this.tagsService.findByDomain(domain);
  }

  // ==================== 层级结构 ====================

  @Get('hierarchy/tree')
  @ApiOperation({ summary: '获取标签层级树' })
  @ApiResponse({ status: 200, description: '返回标签层级树', type: [Tag] })
  async findHierarchy(@Query('rootId') rootId?: string): Promise<Tag[]> {
    return this.tagsService.findHierarchy(rootId);
  }

  @Get('hierarchy/:parentId/children')
  @ApiOperation({ summary: '获取子标签' })
  @ApiParam({ name: 'parentId', description: '父标签ID' })
  @ApiResponse({ status: 200, description: '返回子标签列表', type: [Tag] })
  async findChildren(@Param('parentId') parentId: string): Promise<Tag[]> {
    return this.tagsService.findChildren(parentId);
  }

  // ==================== 标签统计 ====================

  @Get('stats/overview')
  @ApiOperation({ summary: '获取标签统计概览' })
  @ApiResponse({ status: 200, description: '返回标签统计数据' })
  async getStats(): Promise<{
    total: number;
    byDomain: Record<string, number>;
    byCategory: Record<string, number>;
    mostUsed: Tag[];
    unused: Tag[];
  }> {
    return this.tagsService.getStats();
  }

  // ==================== 标签关系 ====================

  @Post(':id/related/:relatedId')
  @ApiOperation({ summary: '添加关联标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiParam({ name: 'relatedId', description: '关联标签ID' })
  @ApiResponse({ status: 200, description: '关联标签添加成功', type: Tag })
  async addRelatedTag(
    @Param('id') id: string,
    @Param('relatedId') relatedId: string,
  ): Promise<Tag> {
    return this.tagsService.addRelatedTag(id, relatedId);
  }

  @Delete(':id/related/:relatedId')
  @ApiOperation({ summary: '移除关联标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiParam({ name: 'relatedId', description: '关联标签ID' })
  @ApiResponse({ status: 200, description: '关联标签移除成功', type: Tag })
  async removeRelatedTag(
    @Param('id') id: string,
    @Param('relatedId') relatedId: string,
  ): Promise<Tag> {
    return this.tagsService.removeRelatedTag(id, relatedId);
  }

  @Get(':id/related')
  @ApiOperation({ summary: '获取关联标签' })
  @ApiParam({ name: 'id', description: '标签ID' })
  @ApiResponse({ status: 200, description: '返回关联标签列表', type: [Tag] })
  async findRelatedTags(@Param('id') id: string): Promise<Tag[]> {
    return this.tagsService.findRelatedTags(id);
  }

  // ==================== 初始化 ====================

  @Post('init/defaults')
  @ApiOperation({ summary: '初始化默认标签' })
  @ApiResponse({ status: 201, description: '默认标签初始化成功' })
  async initDefaultTags(): Promise<void> {
    await this.tagsService.initDefaultTags();
  }
}
