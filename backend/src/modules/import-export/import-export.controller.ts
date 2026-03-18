import {
  Controller,
  Post,
  Body,
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
  ApiConsumes,
} from '@nestjs/swagger';
import type { Request as ExpressRequest } from 'express';
import { ImportExportService } from './import-export.service';
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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    organizationId: string;
  };
}

@ApiTags('数据导入导出')
@Controller('import-export')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Post('policies/import')
  @ApiOperation({ summary: '导入政策文件' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: '导入结果' })
  async importPolicies(
    @Body() dto: ImportPoliciesDto,
    @Request() req: RequestWithUser,
  ): Promise<ImportResult> {
    return this.importExportService.importPolicies(
      dto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Post('policies/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '导出政策文件' })
  @ApiResponse({ status: 200, description: '导出结果' })
  async exportPolicies(@Body() dto: ExportPoliciesDto): Promise<ExportResult> {
    return this.importExportService.exportPolicies(dto);
  }

  @Post('cous/import')
  @ApiOperation({ summary: '导入COU' })
  @ApiResponse({ status: 200, description: '导入结果' })
  async importCOUs(
    @Body() dto: ImportCOUsDto,
    @Request() req: RequestWithUser,
  ): Promise<ImportResult> {
    return this.importExportService.importCOUs(dto, req.user.userId);
  }

  @Post('cous/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '导出COU' })
  @ApiResponse({ status: 200, description: '导出结果' })
  async exportCOUs(@Body() dto: ExportCOUsDto): Promise<ExportResult> {
    return this.importExportService.exportCOUs(dto);
  }

  @Post('scenes/import')
  @ApiOperation({ summary: '导入场景' })
  @ApiResponse({ status: 200, description: '导入结果' })
  async importScenes(
    @Body() dto: ImportScenesDto,
    @Request() req: RequestWithUser,
  ): Promise<ImportResult> {
    return this.importExportService.importScenes(
      dto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Post('scenes/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '导出场景' })
  @ApiResponse({ status: 200, description: '导出结果' })
  async exportScenes(@Body() dto: ExportScenesDto): Promise<ExportResult> {
    return this.importExportService.exportScenes(dto);
  }

  @Post('tags/import')
  @ApiOperation({ summary: '导入标签' })
  @ApiResponse({ status: 200, description: '导入结果' })
  async importTags(
    @Body() dto: ImportTagsDto,
    @Request() req: RequestWithUser,
  ): Promise<ImportResult> {
    return this.importExportService.importTags(dto, req.user.userId);
  }

  @Post('tags/export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '导出标签' })
  @ApiResponse({ status: 200, description: '导出结果' })
  async exportTags(@Body() dto: ExportTagsDto): Promise<ExportResult> {
    return this.importExportService.exportTags(dto);
  }

  @Post('backup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '创建系统备份' })
  @ApiResponse({ status: 200, description: '备份文件' })
  async createBackup(@Body() dto: BackupDataDto): Promise<ExportResult> {
    return this.importExportService.createBackup(dto);
  }

  @Post('restore')
  @ApiOperation({ summary: '恢复系统数据' })
  @ApiResponse({ status: 200, description: '恢复结果' })
  async restoreData(@Body() dto: RestoreDataDto): Promise<ImportResult> {
    return this.importExportService.restoreData(dto);
  }
}
