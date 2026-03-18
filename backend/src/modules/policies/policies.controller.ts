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
  ParseIntPipe,
  DefaultValuePipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../../entities/user.entity';
import {
  CreatePolicyDto,
  UpdatePolicyDto,
  PolicyFilterDto,
  PolicyResponse,
} from './dto/policy.dto';

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all policies with filtering and pagination' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'levels', required: false, type: [String] })
  @ApiQuery({ name: 'industries', required: false, type: [String] })
  @ApiQuery({ name: 'regions', required: false, type: [String] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() filterDto: PolicyFilterDto): Promise<PolicyResponse> {
    return this.policiesService.findAll(filterDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get policy statistics' })
  async getStats() {
    return this.policiesService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  async findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  @Get(':id/clauses')
  @ApiOperation({ summary: 'Get clauses for a policy' })
  async getClauses(@Param('id') id: string) {
    return this.policiesService.getClauses(id);
  }

  @Get(':id/cous')
  @ApiOperation({ summary: 'Get COUs for a policy' })
  async getCOUs(@Param('id') id: string) {
    return this.policiesService.getCOUs(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new policy (Admin only)' })
  async create(
    @Body() createDto: CreatePolicyDto,
    @CurrentUser() user: User,
  ) {
    // TODO: Check if user is admin
    return this.policiesService.create(createDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update policy (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePolicyDto,
    @CurrentUser() user: User,
  ) {
    // TODO: Check if user is admin
    return this.policiesService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete policy (Admin only)' })
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    // TODO: Check if user is admin
    return this.policiesService.remove(id);
  }
}
