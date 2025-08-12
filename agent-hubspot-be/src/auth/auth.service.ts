import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'lib/repository/user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'lib/entity/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly jwt: JwtService,
  ) {}

  private async hashPassword(plain: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(plain, saltRounds);
  }

  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async register(dto: RegisterDto): Promise<{ user: Partial<User>; accessToken: string }> {
    const existed = await this.users.findOne({ where: { email: dto.email } });
    if (existed) {
      throw new BadRequestException('Email already in use');
    }
    const passwordHash = await this.hashPassword(dto.password);
    let user = this.users.create({ name: dto.name ?? null, email: dto.email, password: passwordHash });
    user = await this.users.save(user);
    const accessToken = await this.signToken(user);
    return { user: { id: user.id, name: user.name ?? undefined, email: user.email, role: user.role }, accessToken };
  }

  async login(dto: LoginDto): Promise<{ user: Partial<User>; accessToken: string }> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await this.verifyPassword(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const accessToken = await this.signToken(user);
    return { user: { id: user.id, name: user.name ?? undefined, email: user.email, role: user.role }, accessToken };
  }

  private async signToken(user: User): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET || 'dev-secret',
      expiresIn: '7d',
    });
  }
}


