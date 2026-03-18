import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { COU } from '../../entities/cou.entity';
import {
  CreateCOUDto,
  UpdateCOUDto,
  COUFilterDto,
} from './dto/cou.dto';

@Injectable()
export class COUsService {
  constructor(
    @InjectRepository(COU)
    private couRepository: Repository<COU>,
  ) {}

  async findAll(filterDto: COUFilterDto): Promise<{
    items: COU[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      keyword,
      policyId,
      obligationTypes,
      applicableIndustries,
      applicableRegions,
      weightRange,
      page = 1,
      limit = 20,
      sortBy = 'finalWeight',
      sortOrder = 'DESC',
    } = filterDto;

    const queryBuilder = this.couRepository.createQueryBuilder('cou');

    if (keyword) {
      queryBuilder.where(
        '(cou.title LIKE :keyword OR cou.description LIKE :keyword OR cou.code LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    if (policyId) {
      queryBuilder.andWhere('cou.policyId = :policyId', { policyId });
    }

    if (obligationTypes && obligationTypes.length > 0) {
      queryBuilder.andWhere('cou.obligationType IN (:...obligationTypes)', {
        obligationTypes,
      });
    }

    if (applicableIndustries && applicableIndustries.length > 0) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM unnest(cou.applicableIndustries) AS industry WHERE industry IN (:...applicableIndustries))',
        { applicableIndustries },
      );
    }

    if (applicableRegions && applicableRegions.length > 0) {
      queryBuilder.andWhere(
        'EXISTS (SELECT 1 FROM unnest(cou.applicableRegions) AS region WHERE region IN (:...applicableRegions))',
        { applicableRegions },
      );
    }

    if (weightRange) {
      queryBuilder.andWhere(
        'cou.finalWeight BETWEEN :minWeight AND :maxWeight',
        { minWeight: weightRange[0], maxWeight: weightRange[1] },
      );
    }

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Handle sorting
    const orderDirection = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    if (sortBy === 'finalWeight') {
      queryBuilder.orderBy('cou.finalWeight', orderDirection);
    } else if (sortBy === 'createdAt') {
      queryBuilder.orderBy('cou.createdAt', orderDirection);
    } else if (sortBy === 'title') {
      queryBuilder.orderBy('cou.title', orderDirection);
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<COU> {
    const cou = await this.couRepository.findOne({
      where: { id },
      relations: ['policy'],
    });

    if (!cou) {
      throw new NotFoundException(`COU with ID ${id} not found`);
    }

    return cou;
  }

  async findByCode(code: string): Promise<COU> {
    const cou = await this.couRepository.findOne({
      where: { code },
      relations: ['policy'],
    });

    if (!cou) {
      throw new NotFoundException(`COU with code ${code} not found`);
    }

    return cou;
  }

  async create(createDto: CreateCOUDto): Promise<COU> {
    const cou = this.couRepository.create(createDto);

    // Calculate final weight if not provided
    if (!cou.finalWeight) {
      cou.finalWeight =
        (cou.baseWeight || 0) *
        (cou.penaltyWeight || 1) *
        (cou.tagMatchScore || 1) *
        (cou.scenarioWeight || 1);
    }

    return this.couRepository.save(cou);
  }

  async update(id: string, updateDto: UpdateCOUDto): Promise<COU> {
    const cou = await this.findOne(id);
    Object.assign(cou, updateDto);

    // Recalculate final weight
    cou.finalWeight =
      (cou.baseWeight || 0) *
      (cou.penaltyWeight || 1) *
      (cou.tagMatchScore || 1) *
      (cou.scenarioWeight || 1);

    return this.couRepository.save(cou);
  }

  async remove(id: string): Promise<void> {
    const cou = await this.findOne(id);
    await this.couRepository.remove(cou);
  }

  async getStats(): Promise<{
    total: number;
    byObligationType: Record<string, number>;
    byPriority: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    averageWeight: number;
  }> {
    const total = await this.couRepository.count();

    const byObligationType: Record<string, number> = {};
    const obligationTypes = ['禁止性', '强制性', '推荐性', '指导性'];
    for (const type of obligationTypes) {
      byObligationType[type] = await this.couRepository.count({
        where: { obligationType: type as any },
      });
    }

    const critical = await this.couRepository.count({
      where: { finalWeight: Between(9, 10) },
    });
    const high = await this.couRepository.count({
      where: { finalWeight: Between(7, 8.99) },
    });
    const medium = await this.couRepository.count({
      where: { finalWeight: Between(5, 6.99) },
    });
    const low = await this.couRepository.count({
      where: { finalWeight: Between(0, 4.99) },
    });

    const result = await this.couRepository
      .createQueryBuilder('cou')
      .select('AVG(cou.finalWeight)', 'average')
      .getRawOne();

    return {
      total,
      byObligationType,
      byPriority: {
        critical,
        high,
        medium,
        low,
      },
      averageWeight: parseFloat(result?.average || 0),
    };
  }

  async findRelated(id: string): Promise<COU[]> {
    const cou = await this.findOne(id);

    if (!cou.relatedCOUs || cou.relatedCOUs.length === 0) {
      return [];
    }

    return this.couRepository.find({
      where: cou.relatedCOUs.map((code) => ({ code })),
    });
  }
}
