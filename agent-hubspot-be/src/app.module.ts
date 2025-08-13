import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import * as path from "path";
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoriesModule } from 'lib/module/repository.module';
import { TokenService } from '../lib/service/token.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    RepositoriesModule,
    AuthModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: "mysql",
        host: '103.200.23.68',
        port: parseInt('3306'),
        username: 'keyverse_huudung038',
        password: "?rCx-V9pp8hY&Vy[",
        database: "keyverse_hubspot",
        entities: [path.join(__dirname, "../lib/entity/*.entity{.ts,.js}")],
        synchronize: true,
        logging: false,
        charset: 'utf8mb4',
        extra: {
          charset: 'utf8mb4_unicode_ci',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProvidersModule,
  ],
  controllers: [AppController],
  providers: [AppService, TokenService],
})
export class AppModule { }
