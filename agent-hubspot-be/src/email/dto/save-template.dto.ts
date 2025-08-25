import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SaveTemplateDto {
  @ApiProperty({
    description: 'HTML content of the email template',
    example: '<!doctype html><html><head><meta charset="utf-8"><title>Email</title></head><body><h1>Xin chào</h1><p>Nội dung email ở đây.</p></body></html>'
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'HubSpot portal ID',
    example: '243429254'
  })
  @IsString()
  @IsNotEmpty()
  portalId: string;
}