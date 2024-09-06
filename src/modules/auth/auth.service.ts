import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/loginUserDto.dto';
import * as bcrypt from 'bcrypt';
import { authConstants } from './utils/constants';
import { SessionService } from '../session/session.service';
import { DatabaseMappingFields } from '../../config/interfaces/database-config.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    @Inject('DATABASE_MAPPING_FIELDS')
    private readonly dbMappingFields: DatabaseMappingFields,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const emailField = this.dbMappingFields.emailField;
    const passwordField = this.dbMappingFields.passwordField;

    const user = await this.usersService.findByField(
      emailField,
      loginUserDto.email,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = bcrypt.compareSync(
      loginUserDto.password,
      user[passwordField],
    );

    if (isPasswordValid) {
      delete user[passwordField];

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
      const user = await this.usersService.findByField(
        this.dbMappingFields.emailField,
        session.user.email,
      );

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
