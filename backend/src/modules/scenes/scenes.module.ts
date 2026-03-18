import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Scene, SceneTemplate } from '../../entities';
import { ScenesService } from './scenes.service';
import { ScenesController } from './scenes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Scene, SceneTemplate])],
  controllers: [ScenesController],
  providers: [ScenesService],
  exports: [ScenesService],
})
export class ScenesModule {}
