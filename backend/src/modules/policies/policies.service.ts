import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Policy, PolicyLevel } from '../../entities/policy.entity';
import { Clause } from '../../entities/clause.entity';
import { COU } from '../../entities/cou.entity';
import {
  CreatePolicyDto,
  UpdatePolicyDto,
  PolicyFilterDto,
} from './dto/policy.dto';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectRepository(Policy)
    private policyRepository: Repository<Policy>,
    @InjectRepository(Clause)
    private clauseRepository: Repository<Clause>,
    @InjectRepository(COU)
    private couRepository: Repository<COU>,
  ) {}

  async findAll(filterDto: PolicyFilterDto): Promise<{
    items: Policy[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      keyword,
      levels,
      industries,
      regions,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filterDto;

    const queryBuilder = this.policyRepository.createQueryBuilder('policy');

    if (keyword) {
      queryBuilder.where(
        '(policy.title LIKE :keyword OR policy.code LIKE :keyword OR policy.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (levels && levels.length > 0) {
      queryBuilder.andWhere('policy.level IN (:...levels)', { levels });
    }

    if (industries && industries.length > 0) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM unnest(policy.industries) AS industry WHERE industry IN (:...industries))',
        { industries },
      );
    }

    if (regions && regions.length > 0) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM unnest(policy.regions) AS region WHERE region IN (:...regions))',
        { regions },
      );
    }

    if (status) {
      queryBuilder.andWhere('policy.currentVersion->>status = :status', {
        status,
      });
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Handle sorting
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    if (sortBy === 'createdAt') {
      queryBuilder.orderBy('policy.createdAt', orderDirection);
    } else if (sortBy === 'title') {
      queryBuilder.orderBy('policy.title', orderDirection);
    } else if (sortBy === 'level') {
      queryBuilder.orderBy('policy.level', orderDirection);
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { id },
      relations: ['clauses', 'cous'],
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    return policy;
  }

  async findByCode(code: string): Promise<Policy> {
    const policy = await this.policyRepository.findOne({
      where: { code },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with code ${code} not found`);
    }

    return policy;
  }

  async create(createDto: CreatePolicyDto): Promise<Policy> {
    // Check if code already exists
    const existing = await this.policyRepository.findOne({
      where: { code: createDto.code },
    });
    if (existing) {
      throw new ConflictException(
        `Policy with code ${createDto.code} already exists`,
      );
    }

    const policy = this.policyRepository.create(createDto);
    return this.policyRepository.save(policy);
  }

  async update(id: string, updateDto: UpdatePolicyDto): Promise<Policy> {
    const policy = await this.findOne(id);

    // If code is being updated, check for conflicts
    if (updateDto.code && updateDto.code !== policy.code) {
      const existing = await this.policyRepository.findOne({
        where: { code: updateDto.code },
      });
      if (existing) {
        throw new ConflictException(
          `Policy with code ${updateDto.code} already exists`,
        );
      }
    }

    Object.assign(policy, updateDto);
    return this.policyRepository.save(policy);
  }

  async remove(id: string): Promise<void> {
    const policy = await this.findOne(id);
    await this.policyRepository.remove(policy);
  }

  async getClauses(policyId: string): Promise<Clause[]> {
    return this.clauseRepository.find({
      where: { policyId },
      order: { article: 'ASC' },
    });
  }

  async getCOUs(policyId: string): Promise<COU[]> {
    return this.couRepository.find({
      where: { policyId },
      order: { finalWeight: 'DESC' },
    });
  }

  async getStats(): Promise<{
    total: number;
    byLevel: Record<string, number>;
    byIndustry: Record<string, number>;
    recentUpdates: Policy[];
  }> {
    const total = await this.policyRepository.count();

    const byLevel: Record<string, number> = {};
    const levels = [
      '法律',
      '行政法规',
      '部门规章',
      '国家标准',
      '行业标准',
      '地方性法规',
      '指南指引',
    ];
    for (const level of levels) {
      byLevel[level] = await this.policyRepository.count({
        where: { level: level as PolicyLevel },
      });
    }

    const byIndustry: Record<string, number> = {};
    const policies = await this.policyRepository.find();
    for (const policy of policies) {
      for (const industry of policy.industries) {
        byIndustry[industry] = (byIndustry[industry] || 0) + 1;
      }
    }

    const recentUpdates = await this.policyRepository.find({
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    return {
      total,
      byLevel,
      byIndustry,
      recentUpdates,
    };
  }
}
