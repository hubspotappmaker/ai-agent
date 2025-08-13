import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['system', 'user', 'assistant'],
    example: 'user',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello! This is my message.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class ChatWithMeDto {
  @ApiProperty({
    description: 'HubSpot portal ID associated with the user',
    example: 'abc123',
  })
  @IsString()
  @IsNotEmpty()
  portalId: string;

  @ApiPropertyOptional({
    description: 'Optional chat history. If omitted, service will use a default system+user prompt.',
    type: [ChatMessageDto],
    example: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Write a short greeting.' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages?: ChatMessageDto[];
}
