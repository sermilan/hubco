import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { COUsService } from './cous.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../../entities/user.entity';
import {
  CreateCOUDto,
  UpdateCOUDto,
  COUFilterDto,
  COUResponse,
} from './dto/cou.dto';

@ApiTags('COUs')
@Controller('cous')
export class COUsController {
  constructor(private readonly cousService: COUsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all COUs with filtering and pagination' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'policyId', required: false })
  @ApiQuery({ name: 'obligationTypes', required: false, type: [String] })
  @ApiQuery({ name: 'applicableIndustries', required: false, type: [String] })
  @ApiQuery({ name: 'applicableRegions', required: false, type: [String] })
  @ApiQuery({ name: 'weightRange', required: false, type: [Number] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() filterDto: COUFilterDto): Promise<COUResponse> {
    return this.cousService.findAll(filterDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get COU statistics' })
  async getStats() {
    return this.cousService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get COU by ID' })
  async findOne(@Param('id') id: string) {
    return this.cousService.findOne(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related COUs' })
  async getRelated(@Param('id') id: string) {
    return this.cousService.findRelated(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new COU (Admin only)' })
  async create(
    @Body() createDto: CreateCOUDto,
    @CurrentUser() user: User,
  ) {
    return this.cousService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update COU (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCOUDto,
    @CurrentUser() user: User,
  ) {
    return this.cousService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete COU (Admin only)' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.cousService.remove(id);
  }
}
