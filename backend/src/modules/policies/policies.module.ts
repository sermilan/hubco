import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';
import { Policy } from '../../entities/policy.entity';
import { Clause } from '../../entities/clause.entity';
import { COU } from '../../entities/cou.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Policy, Clause, COU])],
  controllers: [PoliciesController],
  providers: [PoliciesService],
  exports: [PoliciesService],
})
export class PoliciesModule {}
