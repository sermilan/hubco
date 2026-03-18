import {
  Controller,
  Get,
  Query,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SearchService, SearchFilters } from './search.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search policies and COUs' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'type', required: false, isArray: true, enum: ['policy', 'cou', 'clause'] })
  @ApiQuery({ name: 'levels', required: false, isArray: true })
  @ApiQuery({ name: 'industries', required: false, isArray: true })
  @ApiQuery({ name: 'regions', required: false, isArray: true })
  @ApiQuery({ name: 'tags', required: false, isArray: true })
  @ApiQuery({ name: 'weightMin', required: false, type: Number })
  @ApiQuery({ name: 'weightMax', required: false, type: Number })
  @ApiQuery({ name: 'obligationTypes', required: false, isArray: true })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async search(
    @Query('keyword') keyword?: string,
    @Query('type') type?: string | string[],
    @Query('levels') levels?: string | string[],
    @Query('industries') industries?: string | string[],
    @Query('regions') regions?: string | string[],
    @Query('tags') tags?: string | string[],
    @Query('weightMin') weightMin?: string,
    @Query('weightMax') weightMax?: string,
    @Query('obligationTypes') obligationTypes?: string | string[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const filters: SearchFilters = {
      keyword,
      type: type
        ? (Array.isArray(type) ? type : [type]) as ('policy' | 'cou' | 'clause')[]
        : undefined,
      levels: levels
        ? (Array.isArray(levels) ? levels : [levels])
        : undefined,
      industries: industries
        ? (Array.isArray(industries) ? industries : [industries])
        : undefined,
      regions: regions
        ? (Array.isArray(regions) ? regions : [regions])
        : undefined,
      tags: tags
        ? (Array.isArray(tags) ? tags : [tags])
        : undefined,
      weightRange:
        weightMin && weightMax
          ? [parseFloat(weightMin), parseFloat(weightMax)]
          : undefined,
      obligationTypes: obligationTypes
        ? (Array.isArray(obligationTypes)
            ? obligationTypes
            : [obligationTypes])
        : undefined,
    };

    return this.searchService.search(filters, page, limit);
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Get search suggestions' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'size', required: false, type: Number })
  async suggest(
    @Query('q') keyword: string,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) size?: number,
  ) {
    return this.searchService.suggest(keyword, size);
  }
}
