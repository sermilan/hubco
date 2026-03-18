import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Tag, TagCategory, TagDomain } from '../../entities';
import { CreateTagDto, UpdateTagDto, TagQueryDto } from './dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
  ) {}

  // ==================== 标签 CRUD ====================

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const tag = this.tagRepository.create({
      ...createTagDto,
      usageCount: 0,
      isActive: true,
    });

    return this.tagRepository.save(tag);
  }

  async findAll(query: TagQueryDto): Promise<{
    items: Tag[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 50,
      keyword,
      domain,
      category,
      parentId,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const where: any = {};

    // 关键词搜索
    if (keyword) {
      where.name = Like(`%${keyword}%`);
    }

    // 维度筛选
    if (domain) {
      where.domain = domain;
    }

    // 分类筛选
    if (category) {
      where.category = category;
    }

    // 父标签筛选
    if (parentId) {
      where.parentId = parentId;
    }

    const [items, total] = await this.tagRepository.findAndCount({
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

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`标签 #${id} 不存在`);
    }

    return tag;
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    Object.assign(tag, updateTagDto);
    return this.tagRepository.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagRepository.remove(tag);
  }

  // ==================== 批量操作 ====================

  async createMany(dtos: CreateTagDto[]): Promise<Tag[]> {
    const tags = dtos.map((dto) =>
      this.tagRepository.create({
        ...dto,
        usageCount: 0,
        isActive: true,
      }),
    );

    return this.tagRepository.save(tags);
  }

  async removeMany(ids: string[]): Promise<void> {
    await this.tagRepository.delete(ids);
  }

  // ==================== 五维标签分类管理 ====================

  async findByDomain(domain: TagDomain): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { domain, isActive: true },
      order: { level: 'ASC', name: 'ASC' },
    });
  }

  async findAllDomains(): Promise<
    { domain: TagDomain; count: number; tags: Tag[] }[]
  > {
    const domains: TagDomain[] = [
      'object',
      'subject',
      'lifecycle',
      'security',
      'action',
    ];

    const results = await Promise.all(
      domains.map(async (domain) => {
        const [tags, count] = await this.tagRepository.findAndCount({
          where: { domain, isActive: true },
          order: { level: 'ASC', name: 'ASC' },
        });

        return {
          domain,
          count,
          tags,
        };
      }),
    );

    return results;
  }

  // ==================== 层级结构管理 ====================

  async findHierarchy(rootId?: string): Promise<Tag[]> {
    if (rootId) {
      // 获取指定根标签及其所有子标签
      const root = await this.findOne(rootId);
      const path = root.path ? `${root.path}.${root.id}` : root.id;

      return this.tagRepository.find({
        where: [
          { id: rootId },
          { path: Like(`${path}%`) },
        ],
        order: { path: 'ASC', name: 'ASC' },
      });
    }

    // 获取所有顶层标签及其层级
    return this.tagRepository.find({
      order: { path: 'ASC', name: 'ASC' },
    });
  }

  async findChildren(parentId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { parentId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  // ==================== 标签统计 ====================

  async getStats(): Promise<{
    total: number;
    byDomain: Record<TagDomain, number>;
    byCategory: Record<TagCategory, number>;
    mostUsed: Tag[];
    unused: Tag[];
  }> {
    const tags = await this.tagRepository.find();

    const byDomain: Record<TagDomain, number> = {
      object: 0,
      subject: 0,
      lifecycle: 0,
      security: 0,
      action: 0,
    };

    const byCategory: Record<string, number> = {};

    tags.forEach((tag) => {
      byDomain[tag.domain] = (byDomain[tag.domain] || 0) + 1;
      byCategory[tag.category] = (byCategory[tag.category] || 0) + 1;
    });

    // 获取使用最多的标签
    const mostUsed = await this.tagRepository.find({
      where: { isActive: true },
      order: { usageCount: 'DESC' },
      take: 10,
    });

    // 获取未使用的标签
    const unused = await this.tagRepository.find({
      where: { usageCount: 0, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return {
      total: tags.length,
      byDomain,
      byCategory,
      mostUsed,
      unused,
    };
  }

  async incrementUsage(id: string): Promise<void> {
    const tag = await this.findOne(id);
    tag.usageCount += 1;
    await this.tagRepository.save(tag);
  }

  async decrementUsage(id: string): Promise<void> {
    const tag = await this.findOne(id);
    tag.usageCount = Math.max(0, tag.usageCount - 1);
    await this.tagRepository.save(tag);
  }

  // ==================== 标签关系管理 ====================

  async addRelatedTag(id: string, relatedTagId: string): Promise<Tag> {
    const tag = await this.findOne(id);

    if (!tag.relatedTags) {
      tag.relatedTags = [];
    }

    if (!tag.relatedTags.includes(relatedTagId)) {
      tag.relatedTags.push(relatedTagId);
    }

    return this.tagRepository.save(tag);
  }

  async removeRelatedTag(id: string, relatedTagId: string): Promise<Tag> {
    const tag = await this.findOne(id);

    if (tag.relatedTags) {
      tag.relatedTags = tag.relatedTags.filter((id) => id !== relatedTagId);
    }

    return this.tagRepository.save(tag);
  }

  async findRelatedTags(id: string): Promise<Tag[]> {
    const tag = await this.findOne(id);

    if (!tag.relatedTags || tag.relatedTags.length === 0) {
      return [];
    }

    return this.tagRepository.findByIds(tag.relatedTags);
  }

  // ==================== 初始化预设标签 ====================

  async initDefaultTags(): Promise<void> {
    const defaultTags: CreateTagDto[] = [
      // 对象维度 (Object)
      { code: 'OBJ-PI', name: '个人信息', domain: 'object', category: 'core' },
      { code: 'OBJ-SPI', name: '敏感个人信息', domain: 'object', category: 'core' },
      { code: 'OBJ-IMP', name: '重要数据', domain: 'object', category: 'core' },
      { code: 'OBJ-CI', name: '商业信息', domain: 'object', category: 'core' },

      // 主体维度 (Subject)
      { code: 'SUB-ENT', name: '企业', domain: 'subject', category: 'core' },
      { code: 'SUB-PRO', name: '处理者', domain: 'subject', category: 'core' },
      { code: 'SUB-CII', name: '关基运营者', domain: 'subject', category: 'core' },
      { code: 'SUB-GOV', name: '政府部门', domain: 'subject', category: 'core' },

      // 生命周期维度 (Lifecycle)
      { code: 'LIF-COL', name: '收集', domain: 'lifecycle', category: 'core' },
      { code: 'LIF-STO', name: '存储', domain: 'lifecycle', category: 'core' },
      { code: 'LIF-USE', name: '使用', domain: 'lifecycle', category: 'core' },
      { code: 'LIF-PRO', name: '加工', domain: 'lifecycle', category: 'core' },
      { code: 'LIF-TRA', name: '传输', domain: 'lifecycle', category: 'core' },
      { code: 'LIF-PROV', name: '提供', domain: 'lifecycle', category: 'core' },
      { code: 'LIF-DIS', name: '公开', domain: 'lifecycle', category: 'core' },
      { code: 'LIF-DEL', name: '删除', domain: 'lifecycle', category: 'core' },

      // 安全维度 (Security)
      { code: 'SEC-ORG', name: '组织保障', domain: 'security', category: 'core' },
      { code: 'SEC-TEC', name: '技术措施', domain: 'security', category: 'core' },
      { code: 'SEC-CRY', name: '加密', domain: 'security', category: 'core' },
      { code: 'SEC-AUD', name: '审计', domain: 'security', category: 'core' },
      { code: 'SEC-BAC', name: '备份', domain: 'security', category: 'core' },

      // 动作维度 (Action)
      { code: 'ACT-ASS', name: '安全评估', domain: 'action', category: 'core' },
      { code: 'ACT-NOT', name: '通知同意', domain: 'action', category: 'core' },
      { code: 'ACT-REG', name: '合规登记', domain: 'action', category: 'core' },
      { code: 'ACT-TRA', name: '培训教育', domain: 'action', category: 'core' },
      { code: 'ACT-CLI', name: '分类分级', domain: 'action', category: 'core' },
      { code: 'ACT-DOC', name: '文档记录', domain: 'action', category: 'core' },
      { code: 'ACT-AUD', name: '审计检查', domain: 'action', category: 'core' },
      { code: 'ACT-RES', name: '应急响应', domain: 'action', category: 'core' },
      { code: 'ACT-IMP', name: '影响评估', domain: 'action', category: 'core' },
      { code: 'ACT-CON', name: '合同约束', domain: 'action', category: 'core' },
      { code: 'ACT-ENC', name: '加密保护', domain: 'action', category: 'core' },
      { code: 'ACT-ACC', name: '访问控制', domain: 'action', category: 'core' },
    ];

    // 检查是否已存在
    const existingTags = await this.tagRepository.find();
    const existingCodes = new Set(existingTags.map((t) => t.code));

    const newTags = defaultTags.filter((t) => !existingCodes.has(t.code));

    if (newTags.length > 0) {
      await this.createMany(newTags);
    }
  }
}
