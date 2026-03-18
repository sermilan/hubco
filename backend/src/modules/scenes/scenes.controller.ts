import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
  ApiParam,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { ScenesService } from './scenes.service';
import {
  CreateSceneDto,
  UpdateSceneDto,
  SceneQueryDto,
  CreateSceneTemplateDto,
} from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Scene, SceneTemplate } from '../../entities';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    organizationId: string;
  };
}

@ApiTags('场景管理')
@Controller('scenes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ScenesController {
  constructor(private readonly scenesService: ScenesService) {}

  // ==================== 场景 CRUD ====================

  @Post()
  @ApiOperation({ summary: '创建场景' })
  @ApiResponse({ status: 201, description: '场景创建成功', type: Scene })
  async create(
    @Body() createSceneDto: CreateSceneDto,
    @Request() req: RequestWithUser,
  ): Promise<Scene> {
    return this.scenesService.create(
      createSceneDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
  @ApiOperation({ summary: '获取场景列表' })
  @ApiResponse({ status: 200, description: '返回场景列表' })
  async findAll(
    @Query() query: SceneQueryDto,
    @Request() req: RequestWithUser,
  ): Promise<{
    items: Scene[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.scenesService.findAll(
      query,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '获取场景详情' })
  @ApiParam({ name: 'id', description: '场景ID' })
  @ApiResponse({ status: 200, description: '返回场景详情', type: Scene })
  @ApiResponse({ status: 404, description: '场景不存在' })
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser): Promise<Scene> {
    return this.scenesService.findOne(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: '更新场景' })
  @ApiParam({ name: 'id', description: '场景ID' })
  @ApiResponse({ status: 200, description: '场景更新成功', type: Scene })
  async update(
    @Param('id') id: string,
    @Body() updateSceneDto: UpdateSceneDto,
    @Request() req: RequestWithUser,
  ): Promise<Scene> {
    return this.scenesService.update(
      id,
      updateSceneDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除场景' })
  @ApiParam({ name: 'id', description: '场景ID' })
  @ApiResponse({ status: 204, description: '场景删除成功' })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser): Promise<void> {
    return this.scenesService.remove(id, req.user.userId, req.user.organizationId);
  }

  // ==================== 场景克隆 ====================

  @Post(':id/clone')
  @ApiOperation({ summary: '克隆场景' })
  @ApiParam({ name: 'id', description: '场景ID' })
  @ApiResponse({ status: 201, description: '场景克隆成功', type: Scene })
  async clone(
    @Param('id') id: string,
    @Body('name') newName: string,
    @Request() req: RequestWithUser,
  ): Promise<Scene> {
    return this.scenesService.clone(
      id,
      req.user.userId,
      req.user.organizationId,
      newName,
    );
  }

  // ==================== 场景版本 ====================

  @Post(':id/versions')
  @ApiOperation({ summary: '创建新版本' })
  @ApiParam({ name: 'id', description: '场景ID' })
  @ApiResponse({ status: 201, description: '版本创建成功', type: Scene })
  async createVersion(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Request() req: RequestWithUser,
  ): Promise<Scene> {
    return this.scenesService.createVersion(
      id,
      req.user.userId,
      req.user.organizationId,
      notes,
    );
  }

  // ==================== 场景统计 ====================

  @Get('stats/overview')
  @ApiOperation({ summary: '获取场景统计概览' })
  @ApiResponse({ status: 200, description: '返回场景统计数据' })
  async getStats(@Request() req: RequestWithUser): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
    publicCount: number;
  }> {
    return this.scenesService.getStats(req.user.organizationId);
  }

  // ==================== 场景模板 ====================

  @Get('templates/list')
  @ApiOperation({ summary: '获取场景模板列表' })
  @ApiResponse({ status: 200, description: '返回模板列表', type: [SceneTemplate] })
  async findAllTemplates(
    @Query('category') category?: string,
    @Query('isPopular') isPopular?: string,
    @Query('isActive') isActive?: string,
  ): Promise<SceneTemplate[]> {
    return this.scenesService.findAllTemplates({
      category,
      isPopular: isPopular !== undefined ? isPopular === 'true' : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Get('templates/:id')
  @ApiOperation({ summary: '获取模板详情' })
  @ApiParam({ name: 'id', description: '模板ID' })
  @ApiResponse({ status: 200, description: '返回模板详情', type: SceneTemplate })
  async findOneTemplate(@Param('id') id: string): Promise<SceneTemplate> {
    return this.scenesService.findOneTemplate(id);
  }

  @Post('templates')
  @ApiOperation({ summary: '创建场景模板' })
  @ApiResponse({ status: 201, description: '模板创建成功', type: SceneTemplate })
  async createTemplate(
    @Body() dto: CreateSceneTemplateDto,
  ): Promise<SceneTemplate> {
    return this.scenesService.createTemplate(dto);
  }

  @Put('templates/:id')
  @ApiOperation({ summary: '更新场景模板' })
  @ApiParam({ name: 'id', description: '模板ID' })
  @ApiResponse({ status: 200, description: '模板更新成功', type: SceneTemplate })
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: Partial<CreateSceneTemplateDto>,
  ): Promise<SceneTemplate> {
    return this.scenesService.updateTemplate(id, dto);
  }

  @Delete('templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除场景模板' })
  @ApiParam({ name: 'id', description: '模板ID' })
  @ApiResponse({ status: 204, description: '模板删除成功' })
  async removeTemplate(@Param('id') id: string): Promise<void> {
    return this.scenesService.removeTemplate(id);
  }

  // ==================== 从模板创建场景 ====================

  @Post('from-template/:templateId')
  @ApiOperation({ summary: '从模板创建场景' })
  @ApiParam({ name: 'templateId', description: '模板ID' })
  @ApiResponse({ status: 201, description: '场景创建成功', type: Scene })
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body() customizations: {
      name?: string;
      description?: string;
      industry?: string;
      region?: string;
      userType?: string;
    },
    @Request() req: RequestWithUser,
  ): Promise<Scene> {
    return this.scenesService.createFromTemplate(
      templateId,
      req.user.userId,
      req.user.organizationId,
      customizations,
    );
  }
}
