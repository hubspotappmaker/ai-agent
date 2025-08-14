import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerateEmailDto {
  @ApiProperty({
    description: 'Instruction/content to generate the email for',
    example: 'Write a short follow-up email after a product demo.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}