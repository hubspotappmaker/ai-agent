import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SampleChatItemDto {
  @ApiProperty({
    description: 'Sample chat ID',
    type: String,
    example: 'a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
  })
  id?: string;

  @ApiProperty({
    description: 'Sample chat content',
    type: String,
    example: 'Sample chat 1',
  })
  content: string;
}

export class CreateSampleChatDto {
  @ApiProperty({
    description: 'Sample chat content',
    type: String,
    example: 'New sample chat',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}