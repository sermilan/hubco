import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Policy, COU, Scene, Tag, Clause } from '../../entities';
import {
  ImportPoliciesDto,
  ExportPoliciesDto,
  ImportCOUsDto,
  ExportCOUsDto,
  ImportScenesDto,
  ExportScenesDto,
  ImportTagsDto,
  ExportTagsDto,
  BackupDataDto,
  RestoreDataDto,
  ImportResult,
  ExportResult,
} from './dto';

@Injectable()
export class ImportExportService {
  private readonly logger = new Logger(ImportExportService.name);

  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    @InjectRepository(COU)
    private couRepository: Repository<COU>,
    @InjectRepository(Scene)
    private sceneRepository: Repository<Scene>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Clause)
    private clauseRepository: Repository<Clause>,
  ) {}

  // ==================== 政策导入/导出 ====================

  async importPolicies(dto: ImportPoliciesDto, userId: string, organizationId: string): Promise<ImportResult> {
    this.logger.log(`Importing policies from ${dto.format}`);

    try {
      const content = Buffer.from(dto.content, 'base64').toString('utf-8');
      const policies = this.parseContent(content, dto.format);

      const result: ImportResult = {
        total: policies.length,
        success: 0,
        failed: 0,
        skipped: 0,
        updated: 0,
        errors: [],
        importedIds: [],
      };

      for (const policyData of policies) {
        try {
          // 检查重复
          const existing = await this.policyRepository.findOne({
            where: { code: policyData.code || policyData.documentNumber },
          });

          if (existing) {
            if (dto.duplicateStrategy === 'skip') {
              result.skipped++;
              continue;
            } else if (dto.duplicateStrategy === 'update') {
              await this.policyRepository.save({
                ...existing,
                ...policyData,
                updatedAt: new Date(),
              });
              result.updated++;
              result.importedIds.push(existing.id);
              continue;
            }
          }

          // 创建新政策
          const policy = this.policyRepository.create({
            ...policyData,
            createdBy: userId,
            organizationId,
          });

          const saved = (await this.policyRepository.save(policy)) as unknown as Policy;
          result.success++;
          result.importedIds.push(saved.id);
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import policy: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  async exportPolicies(dto: ExportPoliciesDto): Promise<ExportResult> {
    this.logger.log(`Exporting policies to ${dto.format}`);

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (dto.policyIds?.length) {
      where.id = In(dto.policyIds);
    } else if (dto.filters) {
      if (dto.filters.level?.length) {
        where.level = In(dto.filters.level);
      }
      if (dto.filters.industry?.length) {
        where.industry = In(dto.filters.industry);
      }
      if (dto.filters.status?.length) {
        where.status = In(dto.filters.status);
      }
      if (dto.filters.startDate || dto.filters.endDate) {
        where.issueDate = this.buildDateRange(dto.filters.startDate, dto.filters.endDate);
      }
    }

    const policies = await this.policyRepository.find({
      where,
      relations: dto.includeClauses ? ['clauses'] : [],
    });

    const exportData = policies.map(policy => ({
      ...policy,
      cous: dto.includeCOUs ? [] : undefined,
    }));

    const content = this.serializeContent(exportData, dto.format);
    const contentBuffer = Buffer.from(content);

    return {
      format: dto.format,
      count: policies.length,
      content: contentBuffer.toString('base64'),
      filename: `policies_export_${new Date().toISOString().split('T')[0]}.${this.getFileExtension(dto.format)}`,
      size: contentBuffer.length,
    };
  }

  // ==================== COU导入/导出 ====================

  async importCOUs(dto: ImportCOUsDto, userId: string): Promise<ImportResult> {
    this.logger.log(`Importing COUs from ${dto.format}`);

    try {
      const content = Buffer.from(dto.content, 'base64').toString('utf-8');
      const cous = this.parseContent(content, dto.format);

      const result: ImportResult = {
        total: cous.length,
        success: 0,
        failed: 0,
        skipped: 0,
        updated: 0,
        errors: [],
        importedIds: [],
      };

      for (const couData of cous) {
        try {
          // 验证关联的政策
          if (dto.policyId) {
            couData.policyId = dto.policyId;
          }

          if (couData.policyId) {
            const policy = await this.policyRepository.findOne({
              where: { id: couData.policyId },
            });
            if (!policy) {
              result.failed++;
              result.errors.push(`Policy not found: ${couData.policyId}`);
              continue;
            }
          }

          // 检查重复
          const existing = await this.couRepository.findOne({
            where: { code: couData.code },
          });

          if (existing) {
            if (dto.duplicateStrategy === 'skip') {
              result.skipped++;
              continue;
            } else if (dto.duplicateStrategy === 'update') {
              await this.couRepository.save({
                ...existing,
                ...couData,
                updatedAt: new Date(),
              });
              result.updated++;
              result.importedIds.push(existing.id);
              continue;
            }
          }

          const cou = this.couRepository.create({
            ...couData,
            createdBy: userId,
          });

          const saved = (await this.couRepository.save(cou)) as unknown as COU;
          result.success++;
          result.importedIds.push(saved.id);
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import COU: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  async exportCOUs(dto: ExportCOUsDto): Promise<ExportResult> {
    this.logger.log(`Exporting COUs to ${dto.format}`);

    const where: Record<string, unknown> = {};

    if (dto.couIds?.length) {
      where.id = In(dto.couIds);
    } else if (dto.filters) {
      if (dto.filters.status?.length) {
        where.status = In(dto.filters.status);
      }
      if (dto.filters.obligationType?.length) {
        where.obligationType = In(dto.filters.obligationType);
      }
      if (dto.filters.penaltyLevel?.length) {
        where.penaltyLevel = In(dto.filters.penaltyLevel);
      }
      if (dto.filters.minWeight !== undefined || dto.filters.maxWeight !== undefined) {
        where.finalWeight = this.buildWeightRange(dto.filters.minWeight, dto.filters.maxWeight);
      }
    }

    const cous = await this.couRepository.find({
      where,
      relations: dto.includeTags ? ['tags'] : [],
    });

    const exportData = cous.map(cou => ({
      ...cou,
      weightCalculation: dto.includeWeights ? this.calculateWeightDetails(cou) : undefined,
    }));

    const content = this.serializeContent(exportData, dto.format);
    const contentBuffer = Buffer.from(content);

    return {
      format: dto.format,
      count: cous.length,
      content: contentBuffer.toString('base64'),
      filename: `cous_export_${new Date().toISOString().split('T')[0]}.${this.getFileExtension(dto.format)}`,
      size: contentBuffer.length,
    };
  }

  // ==================== 场景导入/导出 ====================

  async importScenes(dto: ImportScenesDto, userId: string, organizationId: string): Promise<ImportResult> {
    this.logger.log(`Importing scenes from ${dto.format}`);

    try {
      const content = Buffer.from(dto.content, 'base64').toString('utf-8');
      const scenes = this.parseContent(content, dto.format);

      const result: ImportResult = {
        total: scenes.length,
        success: 0,
        failed: 0,
        skipped: 0,
        updated: 0,
        errors: [],
        importedIds: [],
      };

      for (const sceneData of scenes) {
        try {
          const scene = this.sceneRepository.create({
            ...sceneData,
            createdBy: userId,
            organizationId,
            isTemplate: dto.asTemplate,
          });

          const saved = (await this.sceneRepository.save(scene)) as unknown as Scene;
          result.success++;
          result.importedIds.push(saved.id);
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import scene: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  async exportScenes(dto: ExportScenesDto): Promise<ExportResult> {
    this.logger.log(`Exporting scenes to ${dto.format}`);

    const where: Record<string, unknown> = {};

    if (dto.sceneIds?.length) {
      where.id = In(dto.sceneIds);
    }

    const scenes = await this.sceneRepository.find({ where });

    const exportData = await Promise.all(scenes.map(async scene => {
      const data: Record<string, unknown> = { ...scene };

      if (dto.includeFullCOUs && scene.couReferences?.length) {
        const couIds = scene.couReferences.map(m => m.couId);
        const cous = await this.couRepository.findBy({ id: In(couIds) });
        data.fullCOUs = cous;
      }

      return data;
    }));

    const content = this.serializeContent(exportData, dto.format);
    const contentBuffer = Buffer.from(content);

    return {
      format: dto.format,
      count: scenes.length,
      content: contentBuffer.toString('base64'),
      filename: `scenes_export_${new Date().toISOString().split('T')[0]}.${this.getFileExtension(dto.format)}`,
      size: contentBuffer.length,
    };
  }

  // ==================== 标签导入/导出 ====================

  async importTags(dto: ImportTagsDto, userId: string): Promise<ImportResult> {
    this.logger.log(`Importing tags from ${dto.format}`);

    try {
      const content = Buffer.from(dto.content, 'base64').toString('utf-8');
      const tags = this.parseContent(content, dto.format);

      const result: ImportResult = {
        total: tags.length,
        success: 0,
        failed: 0,
        skipped: 0,
        updated: 0,
        errors: [],
        importedIds: [],
      };

      for (const tagData of tags) {
        try {
          // 检查重复
          const existing = await this.tagRepository.findOne({
            where: { name: tagData.name },
          });

          if (existing) {
            if (dto.updateExisting) {
              await this.tagRepository.save({
                ...existing,
                ...tagData,
                updatedAt: new Date(),
              });
              result.updated++;
              result.importedIds.push(existing.id);
            } else {
              result.skipped++;
            }
            continue;
          }

          const tag = this.tagRepository.create({
            ...tagData,
            createdBy: userId,
          });

          const saved = (await this.tagRepository.save(tag)) as unknown as Tag;
          result.success++;
          result.importedIds.push(saved.id);
        } catch (error) {
          result.failed++;
          result.errors.push(`Failed to import tag: ${error.message}`);
        }
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Import failed: ${error.message}`);
    }
  }

  async exportTags(dto: ExportTagsDto): Promise<ExportResult> {
    this.logger.log(`Exporting tags to ${dto.format}`);

    const where: Record<string, unknown> = {};

    if (dto.domains?.length) {
      where.domain = In(dto.domains);
    }

    const tags = await this.tagRepository.find({ where });

    const exportData = dto.includeStats
      ? await Promise.all(tags.map(async tag => ({
          ...tag,
          usageCount: await this.getTagUsageCount(tag.id),
        })))
      : tags;

    const content = this.serializeContent(exportData, dto.format);
    const contentBuffer = Buffer.from(content);

    return {
      format: dto.format,
      count: tags.length,
      content: contentBuffer.toString('base64'),
      filename: `tags_export_${new Date().toISOString().split('T')[0]}.${this.getFileExtension(dto.format)}`,
      size: contentBuffer.length,
    };
  }

  // ==================== 备份/恢复 ====================

  async createBackup(dto: BackupDataDto): Promise<ExportResult> {
    this.logger.log('Creating system backup');

    const include = dto.include || ['all'];
    const backupData: Record<string, unknown> = {
      version: '1.0',
      timestamp: new Date().toISOString(),
    };

    if (include.includes('all') || include.includes('policies')) {
      backupData.policies = await this.policyRepository.find({
        relations: ['clauses'],
      });
    }

    if (include.includes('all') || include.includes('cous')) {
      backupData.cous = await this.couRepository.find({
        relations: ['tags'],
      });
    }

    if (include.includes('all') || include.includes('scenes')) {
      backupData.scenes = await this.sceneRepository.find({
        relations: ['couMappings'],
      });
    }

    if (include.includes('all') || include.includes('tags')) {
      backupData.tags = await this.tagRepository.find();
    }

    let content = JSON.stringify(backupData, null, 2);

    // 简单的密码保护（生产环境应使用更强的加密）
    if (dto.password) {
      content = this.encryptContent(content, dto.password);
    }

    const contentBuffer = Buffer.from(content);

    return {
      format: 'json',
      count: Object.keys(backupData).length - 2, // 排除 version 和 timestamp
      content: contentBuffer.toString('base64'),
      filename: `backup_${new Date().toISOString().split('T')[0]}.json`,
      size: contentBuffer.length,
    };
  }

  async restoreData(dto: RestoreDataDto): Promise<ImportResult> {
    this.logger.log('Restoring system data');

    try {
      let content = Buffer.from(dto.content, 'base64').toString('utf-8');

      // 解密
      if (dto.password) {
        content = this.decryptContent(content, dto.password);
      }

      const backupData = JSON.parse(content);
      const result: ImportResult = {
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        updated: 0,
        errors: [],
        importedIds: [],
      };

      // 恢复政策
      if (backupData.policies?.length) {
        for (const policy of backupData.policies) {
          try {
            if (dto.strategy === 'replace') {
              await this.policyRepository.delete({ id: policy.id });
            }
            await this.policyRepository.save(policy);
            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Failed to restore policy: ${error.message}`);
          }
        }
        result.total += backupData.policies.length;
      }

      // 恢复COU
      if (backupData.cous?.length) {
        for (const cou of backupData.cous) {
          try {
            if (dto.strategy === 'replace') {
              await this.couRepository.delete({ id: cou.id });
            }
            await this.couRepository.save(cou);
            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Failed to restore COU: ${error.message}`);
          }
        }
        result.total += backupData.cous.length;
      }

      // 恢复场景
      if (backupData.scenes?.length) {
        for (const scene of backupData.scenes) {
          try {
            if (dto.strategy === 'replace') {
              await this.sceneRepository.delete({ id: scene.id });
            }
            await this.sceneRepository.save(scene);
            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Failed to restore scene: ${error.message}`);
          }
        }
        result.total += backupData.scenes.length;
      }

      // 恢复标签
      if (backupData.tags?.length) {
        for (const tag of backupData.tags) {
          try {
            if (dto.strategy === 'replace') {
              await this.tagRepository.delete({ id: tag.id });
            }
            await this.tagRepository.save(tag);
            result.success++;
          } catch (error) {
            result.failed++;
            result.errors.push(`Failed to restore tag: ${error.message}`);
          }
        }
        result.total += backupData.tags.length;
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Restore failed: ${error.message}`);
    }
  }

  // ==================== 辅助方法 ====================

  private parseContent(content: string, format: string): any[] {
    switch (format) {
      case 'json':
        const jsonData = JSON.parse(content);
        return Array.isArray(jsonData) ? jsonData : [jsonData];
      case 'csv':
        return this.parseCSV(content);
      case 'yaml':
        // 简化实现，实际应使用 yaml 库
        return JSON.parse(content);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private serializeContent(data: any, format: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.serializeCSV(data);
      case 'yaml':
        // 简化实现，实际应使用 yaml 库
        return JSON.stringify(data, null, 2);
      case 'pdf':
        throw new Error('PDF export not implemented in this version');
      case 'excel':
        throw new Error('Excel export not implemented in this version');
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private parseCSV(content: string): any[] {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const results: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      results.push(obj);
    }

    return results;
  }

  private serializeCSV(data: any[]): string {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const lines = [headers.join(',')];

    for (const item of data) {
      const values = headers.map(header => {
        const value = item[header];
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        return String(value || '');
      });
      lines.push(values.join(','));
    }

    return lines.join('\n');
  }

  private getFileExtension(format: string): string {
    const extensions: Record<string, string> = {
      json: 'json',
      csv: 'csv',
      yaml: 'yaml',
      excel: 'xlsx',
      pdf: 'pdf',
    };
    return extensions[format] || 'txt';
  }

  private buildDateRange(startDate?: string, endDate?: string): Record<string, Date> {
    const range: Record<string, Date> = {};
    if (startDate) range.gte = new Date(startDate);
    if (endDate) range.lte = new Date(endDate);
    return range;
  }

  private buildWeightRange(minWeight?: number, maxWeight?: number): Record<string, number> {
    const range: Record<string, number> = {};
    if (minWeight !== undefined) range.gte = minWeight;
    if (maxWeight !== undefined) range.lte = maxWeight;
    return range;
  }

  private calculateWeightDetails(cou: COU): Record<string, unknown> {
    return {
      baseWeight: cou.baseWeight,
      penaltyWeight: cou.penaltyWeight,
      finalWeight: cou.finalWeight,
      calculation: {
        base: cou.baseWeight,
        penaltyMultiplier: cou.penaltyWeight / 10,
        formula: 'finalWeight = baseWeight * (penaltyWeight / 10)',
      },
    };
  }

  private async getTagUsageCount(tagId: string): Promise<number> {
    // 统计标签被使用的次数
    const cousWithTag = await this.couRepository.count({
      where: { tags: { id: tagId } },
    });
    return cousWithTag;
  }

  private encryptContent(content: string, password: string): string {
    // 简化实现，生产环境应使用强加密
    const xor = (str: string, key: string): string => {
      let result = '';
      for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    };
    return Buffer.from(xor(content, password)).toString('base64');
  }

  private decryptContent(content: string, password: string): string {
    const xor = (str: string, key: string): string => {
      let result = '';
      for (let i = 0; i < str.length; i++) {
        result += String.fromCharCode(str.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    };
    return xor(Buffer.from(content, 'base64').toString('utf-8'), password);
  }
}
