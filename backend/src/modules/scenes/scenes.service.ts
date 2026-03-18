import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Scene, SceneTemplate, SceneStatus } from '../../entities';
import {
  CreateSceneDto,
  UpdateSceneDto,
  SceneQueryDto,
  CreateSceneTemplateDto,
} from './dto';

@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(Scene)
    private sceneRepository: Repository<Scene>,
    @InjectRepository(SceneTemplate)
    private sceneTemplateRepository: Repository<SceneTemplate>,
  ) {}

  // ==================== 场景管理 ====================

  async create(
    createSceneDto: CreateSceneDto,
    userId: string,
    organizationId: string,
  ): Promise<Scene> {
    const scene = this.sceneRepository.create({
      ...createSceneDto,
      userId,
      organizationId,
      status: createSceneDto.status || 'draft',
      version: '1.0.0',
      totalCOUs: createSceneDto.cous?.length || 0,
      totalWeight: 0,
      averageWeight: 0,
      highPriorityCOUs: 0,
      complianceScore: 0,
      completeness: 0,
      tagDistribution: {},
    });

    return this.sceneRepository.save(scene);
  }

  async findAll(query: SceneQueryDto, userId: string, organizationId: string): Promise<{
    items: Scene[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 20,
      keyword,
      status,
      industry,
      region,
      templateId,
      isPublic,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: any = {
      organizationId,
    };

    // 关键词搜索
    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    // 状态筛选
    if (status) {
      where.status = status;
    }

    // 行业筛选
    if (industry) {
      where.industry = industry;
    }

    // 地区筛选
    if (region) {
      where.region = region;
    }

    // 模板筛选
    if (templateId) {
      where.basedOnTemplate = templateId;
    }

    // 公开/私有筛选
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    }

    const [items, total] = await this.sceneRepository.findAndCount({
      where,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string, userId: string, organizationId: string): Promise<Scene> {
    const scene = await this.sceneRepository.findOne({
      where: { id, organizationId },
    });

    if (!scene) {
      throw new NotFoundException(`场景 #${id} 不存在`);
    }

    return scene;
  }

  async update(
    id: string,
    updateSceneDto: UpdateSceneDto,
    userId: string,
    organizationId: string,
  ): Promise<Scene> {
    const scene = await this.findOne(id, userId, organizationId);

    // 更新 COU 计数
    if (updateSceneDto.cous) {
      updateSceneDto.totalCOUs = updateSceneDto.cous.length;
    }

    Object.assign(scene, updateSceneDto);
    return this.sceneRepository.save(scene);
  }

  async remove(id: string, userId: string, organizationId: string): Promise<void> {
    const scene = await this.findOne(id, userId, organizationId);
    await this.sceneRepository.remove(scene);
  }

  // ==================== 场景克隆 ====================

  async clone(
    id: string,
    userId: string,
    organizationId: string,
    newName?: string,
  ): Promise<Scene> {
    const scene = await this.findOne(id, userId, organizationId);

    const clonedScene = this.sceneRepository.create({
      ...scene,
      id: undefined,
      name: newName || `${scene.name} (复制)`,
      status: 'draft',
      version: '1.0.0',
      isPublic: false,
      createdAt: undefined,
      updatedAt: undefined,
    });

    return this.sceneRepository.save(clonedScene);
  }

  // ==================== 场景版本管理 ====================

  async createVersion(
    id: string,
    userId: string,
    organizationId: string,
    versionNotes?: string,
  ): Promise<Scene> {
    const scene = await this.findOne(id, userId, organizationId);

    // 解析当前版本号并递增
    const versionParts = scene.version.split('.').map(Number);
    versionParts[2] = (versionParts[2] || 0) + 1;
    const newVersion = versionParts.join('.');

    scene.version = newVersion;

    return this.sceneRepository.save(scene);
  }

  // ==================== 场景统计 ====================

  async getStats(organizationId: string): Promise<{
    total: number;
    byStatus: Record<SceneStatus, number>;
    byIndustry: Record<string, number>;
    byRegion: Record<string, number>;
    publicCount: number;
  }> {
    const scenes = await this.sceneRepository.find({
      where: { organizationId },
    });

    const byStatus: Record<SceneStatus, number> = {
      draft: 0,
      active: 0,
      archived: 0,
    };

    const byIndustry: Record<string, number> = {};
    const byRegion: Record<string, number> = {};

    let publicCount = 0;

    scenes.forEach((scene) => {
      // 状态统计
      byStatus[scene.status] = (byStatus[scene.status] || 0) + 1;

      // 行业统计
      byIndustry[scene.industry] = (byIndustry[scene.industry] || 0) + 1;

      // 地区统计
      byRegion[scene.region] = (byRegion[scene.region] || 0) + 1;

      // 公开统计
      if (scene.isPublic) {
        publicCount++;
      }
    });

    return {
      total: scenes.length,
      byStatus,
      byIndustry,
      byRegion,
      publicCount,
    };
  }

  // ==================== 场景模板管理 ====================

  async createTemplate(
    dto: CreateSceneTemplateDto,
  ): Promise<SceneTemplate> {
    const template = this.sceneTemplateRepository.create({
      ...dto,
      requiredTags: dto.requiredTags || dto.tagProfile?.requiredTags || [],
      optionalTags: dto.optionalTags || dto.tagProfile?.preferredTags || [],
      usageCount: 0,
      isPopular: false,
      isActive: true,
    });

    return this.sceneTemplateRepository.save(template);
  }

  async findAllTemplates(query: {
    category?: string;
    isPopular?: boolean;
    isActive?: boolean;
  }): Promise<SceneTemplate[]> {
    const where: any = {};

    if (query.category) {
      where.category = query.category;
    }

    if (query.isPopular !== undefined) {
      where.isPopular = query.isPopular;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    return this.sceneTemplateRepository.find({
      where,
      order: { usageCount: 'DESC' },
    });
  }

  async findOneTemplate(id: string): Promise<SceneTemplate> {
    const template = await this.sceneTemplateRepository.findOne({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`模板 #${id} 不存在`);
    }

    return template;
  }

  async updateTemplate(
    id: string,
    dto: Partial<CreateSceneTemplateDto>,
  ): Promise<SceneTemplate> {
    const template = await this.findOneTemplate(id);

    Object.assign(template, dto);
    return this.sceneTemplateRepository.save(template);
  }

  async removeTemplate(id: string): Promise<void> {
    const template = await this.findOneTemplate(id);
    await this.sceneTemplateRepository.remove(template);
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = await this.findOneTemplate(id);
    template.usageCount += 1;

    // 如果使用次数超过100，标记为热门
    if (template.usageCount >= 100) {
      template.isPopular = true;
    }

    await this.sceneTemplateRepository.save(template);
  }

  // ==================== 从模板创建场景 ====================

  async createFromTemplate(
    templateId: string,
    userId: string,
    organizationId: string,
    customizations?: {
      name?: string;
      description?: string;
      industry?: string;
      region?: string;
      userType?: string;
    },
  ): Promise<Scene> {
    const template = await this.findOneTemplate(templateId);

    const scene = this.sceneRepository.create({
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      industry: customizations?.industry || template.targetIndustries[0] || '',
      region: customizations?.region || template.targetRegions[0] || '',
      userType: customizations?.userType || template.targetUserTypes[0] || '',
      specialRequirements: [],
      selectedTags: {
        objects: [],
        subjects: [],
        lifecycles: [],
        securities: [],
        actions: template.tagProfile?.requiredTags || [],
      },
      couReferences: [],
      cous: template.recommendedCOUs || [],
      totalCOUs: template.recommendedCOUs?.length || 0,
      matchingConfig: template.matchingConfig,
      totalWeight: 0,
      averageWeight: 0,
      highPriorityCOUs: 0,
      complianceScore: 0,
      completeness: 0,
      tagDistribution: {},
      version: '1.0.0',
      status: 'draft',
      isPublic: false,
      basedOnTemplate: templateId,
      userId,
      organizationId,
    });

    // 增加模板使用次数
    await this.incrementTemplateUsage(templateId);

    return this.sceneRepository.save(scene);
  }
}
