import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import {
  Policy,
  COU,
  User,
  Organization,
  Scene,
  Tag,
} from '../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Policy, COU, User, Organization, Scene, Tag])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
