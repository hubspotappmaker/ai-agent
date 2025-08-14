import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateToneDto {
  @ApiProperty({ example: 'Friendly', description: 'Tone title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Use a friendly and supportive voice that sounds approachable and warm.', description: 'Tone description' })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class UpdateToneDto extends PartialType(CreateToneDto) {}