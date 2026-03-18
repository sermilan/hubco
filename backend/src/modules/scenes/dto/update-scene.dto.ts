import { PartialType } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { CreateSceneDto } from './create-scene.dto';

export class UpdateSceneDto extends PartialType(CreateSceneDto) {
  @ApiPropertyOptional({ description: 'COU总数' })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalCOUs?: number;
}
