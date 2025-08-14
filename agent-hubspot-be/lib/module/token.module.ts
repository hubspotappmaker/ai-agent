import { Module } from '@nestjs/common';
import { TokenService } from '../service/token.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RepositoriesModule } from './repository.module';

@Module({
  imports: [HttpModule, ConfigModule, RepositoriesModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}