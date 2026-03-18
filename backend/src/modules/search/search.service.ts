import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  took: number;
}

export interface SearchFilters {
  keyword?: string;
  type?: ('policy' | 'cou' | 'clause')[];
  levels?: string[];
  industries?: string[];
  regions?: string[];
  tags?: string[];
  weightRange?: [number, number];
  obligationTypes?: string[];
  dateRange?: [string, string];
}

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createIndices();
  }

  async createIndices(): Promise<void> {
    try {
      const policyIndexExists = await this.elasticsearchService.indices.exists({
        index: 'policies',
      });

      if (!policyIndexExists) {
        await this.elasticsearchService.indices.create({
          index: 'policies',
          body: {
            settings: {
              analysis: {
                analyzer: {
                  chinese_analyzer: {
                    tokenizer: 'smartcn_tokenizer',
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                title: {
                  type: 'text',
                  analyzer: 'chinese_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                code: { type: 'keyword' },
                level: { type: 'keyword' },
                industries: { type: 'keyword' },
                regions: { type: 'keyword' },
                publishOrg: { type: 'keyword' },
                description: {
                  type: 'text',
                  analyzer: 'chinese_analyzer',
                },
                fullText: {
                  type: 'text',
                  analyzer: 'chinese_analyzer',
                },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        } as any);
        this.logger.log('Created policies index');
      }

      const couIndexExists = await this.elasticsearchService.indices.exists({
        index: 'cous',
      });

      if (!couIndexExists) {
        await this.elasticsearchService.indices.create({
          index: 'cous',
          body: {
            settings: {
              analysis: {
                analyzer: {
                  chinese_analyzer: {
                    tokenizer: 'smartcn_tokenizer',
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: 'keyword' },
                code: { type: 'keyword' },
                title: {
                  type: 'text',
                  analyzer: 'chinese_analyzer',
                  fields: {
                    keyword: { type: 'keyword' },
                  },
                },
                description: {
                  type: 'text',
                  analyzer: 'chinese_analyzer',
                },
                actionRequired: {
                  type: 'text',
                  analyzer: 'chinese_analyzer',
                },
                policyId: { type: 'keyword' },
                policyTitle: { type: 'keyword' },
                policyLevel: { type: 'keyword' },
                obligationType: { type: 'keyword' },
                applicableIndustries: { type: 'keyword' },
                applicableRegions: { type: 'keyword' },
                applicableUserTypes: { type: 'keyword' },
                finalWeight: { type: 'float' },
                tags: { type: 'keyword' },
                createdAt: { type: 'date' },
                updatedAt: { type: 'date' },
              },
            },
          },
        } as any);
        this.logger.log('Created cous index');
      }
    } catch (error) {
      this.logger.error('Failed to create indices', error);
      // Don't throw - indices might already exist or ES might not be ready
    }
  }

  async indexPolicy(policy: any): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: 'policies',
        id: policy.id,
        body: {
          ...policy,
          createdAt: policy.createdAt?.toISOString(),
          updatedAt: policy.updatedAt?.toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index policy ${policy.id}`, error);
    }
  }

  async indexCOU(cou: any): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: 'cous',
        id: cou.id,
        body: {
          ...cou,
          tags: cou.tags?.map((t: any) => t.name) || [],
          createdAt: cou.createdAt?.toISOString(),
          updatedAt: cou.updatedAt?.toISOString(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to index COU ${cou.id}`, error);
    }
  }

  async search(
    filters: SearchFilters,
    page: number = 1,
    limit: number = 20,
  ): Promise<SearchResult<any>> {
    const from = (page - 1) * limit;
    const indices = filters.type
      ? filters.type.map((t) => (t === 'clause' ? 'cous' : `${t}s`)).join(',')
      : 'policies,cous';

    const must: any[] = [];
    const filter: any[] = [];

    // Keyword search
    if (filters.keyword) {
      must.push({
        multi_match: {
          query: filters.keyword,
          fields: ['title^3', 'description^2', 'fullText', 'actionRequired'],
          type: 'best_fields',
          fuzziness: 'AUTO',
        },
      });
    }

    // Level filter
    if (filters.levels?.length) {
      filter.push({
        terms: { level: filters.levels },
      });
    }

    // Industry filter
    if (filters.industries?.length) {
      filter.push({
        bool: {
          should: [
            { terms: { industries: filters.industries } },
            { terms: { applicableIndustries: filters.industries } },
          ],
        },
      });
    }

    // Region filter
    if (filters.regions?.length) {
      filter.push({
        bool: {
          should: [
            { terms: { regions: filters.regions } },
            { terms: { applicableRegions: filters.regions } },
          ],
        },
      });
    }

    // Tags filter
    if (filters.tags?.length) {
      filter.push({
        terms: { tags: filters.tags },
      });
    }

    // Weight range filter
    if (filters.weightRange) {
      filter.push({
        range: {
          finalWeight: {
            gte: filters.weightRange[0],
            lte: filters.weightRange[1],
          },
        },
      });
    }

    // Obligation type filter
    if (filters.obligationTypes?.length) {
      filter.push({
        terms: { obligationType: filters.obligationTypes },
      });
    }

    // Date range filter
    if (filters.dateRange) {
      filter.push({
        range: {
          createdAt: {
            gte: filters.dateRange[0],
            lte: filters.dateRange[1],
          },
        },
      });
    }

    const query = {
      bool: {
        must: must.length ? must : [{ match_all: {} }],
        filter,
      },
    };

    try {
      const result = await this.elasticsearchService.search({
        index: indices,
        from,
        size: limit,
        body: {
          query,
          sort: [{ _score: 'desc' }, { finalWeight: 'desc' }],
          highlight: {
            fields: {
              title: {},
              description: {},
              fullText: { fragment_size: 150, number_of_fragments: 3 },
              actionRequired: { fragment_size: 150, number_of_fragments: 3 },
            },
          },
        },
      } as any);

      const hits = result.hits.hits.map((hit: any) => ({
        id: hit._id,
        type: hit._index === 'policies' ? 'policy' : 'cou',
        ...hit._source,
        highlights: hit.highlight,
        score: hit._score,
      }));

      const totalValue = result.hits.total;
      const total = typeof totalValue === 'number' ? totalValue : (totalValue?.value || 0);

      return {
        items: hits,
        total,
        page,
        limit,
        took: result.took,
      };
    } catch (error) {
      this.logger.error('Search failed', error);
      throw error;
    }
  }

  async suggest(keyword: string, size: number = 10): Promise<string[]> {
    try {
      const result = await this.elasticsearchService.search({
        index: 'policies,cous',
        size: 0,
        body: {
          suggest: {
            text: keyword,
            title_suggest: {
              completion: {
                field: 'title.keyword',
                size,
                fuzzy: {
                  fuzziness: 'AUTO',
                },
              },
            },
          },
        },
      } as any);

      const suggestions =
        (result.suggest?.title_suggest as any)?.[0]?.options?.map(
          (opt: any) => opt.text,
        ) || [];

      return suggestions;
    } catch (error) {
      this.logger.error('Suggestion failed', error);
      return [];
    }
  }

  async deleteIndex(type: 'policy' | 'cou', id: string): Promise<void> {
    try {
      const index = type === 'policy' ? 'policies' : 'cous';
      await this.elasticsearchService.delete({
        index,
        id,
      });
    } catch (error) {
      this.logger.error(`Failed to delete ${type} ${id}`, error);
    }
  }
}
