import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/loginUserDto.dto';
import * as bcrypt from 'bcrypt';
import { authConstants } from './utils/constants';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sessionService: SessionService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const user = await this.usersService.findByEmail(loginUserDto.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = bcrypt.compareSync(
      loginUserDto.password,
      user.password,
    );

    if (isPasswordValid) {
      delete user.password;

      const accessToken = await this.jwtService.signAsync({ ...user });

      const refreshToken = await this.jwtService.signAsync(
        { sub: user.id },
        { secret: authConstants.secret },
      );

      await this.sessionService.createSession(user.id, refreshToken);
      return {
        access_token: accessToken,
        expires_in: authConstants.convertToUnixTime(authConstants.expiresIn),
        token_type: authConstants.tokenType,
        refreshToken: refreshToken,
      };
    }
    throw new UnauthorizedException();
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException('No se ha proporcionado un token');
    }

    await this.sessionService.invalidateSession(token);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: authConstants.secret,
      });

      const session = await this.sessionService.findValidSession(
        decoded.sub,
        refreshToken,
      );

      if (!session) {
        throw new Error('Usuario no encontrado');
      }
      const user = session.user;

      const newAccessToken = this.jwtService.sign(
        { sub: user.id },
        { secret: authConstants.secret },
      );

      const newRefreshToken = this.jwtService.sign(
        { sub: user.id },
        { secret: authConstants.secret },
      );

      await this.sessionService.updateSessionToken(session.id, newRefreshToken);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error(`Error al refrescar el token: ${error.message}`);
    }
  }
}
