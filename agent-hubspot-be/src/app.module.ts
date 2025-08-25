import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import * as path from "path";
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoriesModule } from 'lib/module/repository.module';
import { TokenModule } from '../lib/module/token.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { EmailModule } from './email/email.module';
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
        host: 'localhost',
        port: parseInt('3306'),
        username: 'root',
        password: "12345678",
        database: "agenthubspot",
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
    ChatbotModule,
    EmailModule,
    TokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
