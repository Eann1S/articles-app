import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { toUserDto, UserDto } from '../users/user.dtos';
import { UsersService } from '../users/users.service';
import { AuthDto } from './auth.dtos';
import * as argon2 from 'argon2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private jwtExpirationTime: number;

  constructor(
    private jwtService: JwtService,
    private userService: UsersService,
    private configService: ConfigService,
  ) {
    this.jwtExpirationTime =
      this.configService.get<number>('JWT_EXPIRATION_TIME') || 86400;
  }

  async register(user: AuthDto): Promise<UserDto> {
    const { email, password } = user;

    const existingUser = await this.userService.findOneBy({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await argon2.hash(password);
    const createdUser = await this.userService.create({
      email,
      hashed_password: hashedPassword,
    });

    return toUserDto(createdUser);
  }

  async login(user: AuthDto): Promise<{ accessToken: string }> {
    const { email, password } = user;

    const existingUser = await this.userService.findOneByOrFail({ email });
    const isPasswordValid = await argon2.verify(
      existingUser.hashed_password,
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid password');
    }

    const payload = { sub: existingUser.id };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: `${this.jwtExpirationTime}s`,
    });
    return { accessToken };
  }

  async validateToken(token?: string): Promise<UserDto> {
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.userService.findOneByOrFail({
        id: payload.sub,
      });
      return toUserDto(user);
    } catch (_) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
