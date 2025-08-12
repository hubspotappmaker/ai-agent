import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RepositoriesModule } from 'lib/module/repository.module';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    RepositoriesModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'GF2292Sq3wGWN6B2LbJvTauImlWc13W5',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, JwtStrategy, RolesGuard],
  controllers: [AuthController],
})
export class AuthModule {}


