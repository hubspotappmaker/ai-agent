import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProviderDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String, nullable: true, description: 'Provider secret/API key' })
  key?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ type: Number, minimum: 0, description: 'Maximum token limit' })
  maxToken?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ type: Number, minimum: 0, description: 'Default model id/index for this provider' })
  defaultModel?: number;
}


