import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { COUsService } from './cous.service';
import { COUsController } from './cous.controller';
import { COU } from '../../entities/cou.entity';
import { Policy } from '../../entities/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([COU, Policy])],
  controllers: [COUsController],
  providers: [COUsService],
  exports: [COUsService],
})
export class COUsModule {}
