import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';
import { Policy, COU, Scene, Tag, Clause } from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Policy, COU, Scene, Tag, Clause])],
  controllers: [ImportExportController],
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
