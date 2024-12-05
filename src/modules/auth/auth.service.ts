import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/loginUserDto.dto';
import * as bcrypt from 'bcrypt';
import { authConstants } from './utils/constants';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginUserDto: LoginUserDto, res: Response) {
    const emailField = 'email'; // Ajusta según tu configuración
    const passwordField = 'password'; // Ajusta según tu configuración

    const user = await this.usersService.findByField(
      emailField,
      loginUserDto.email,
    );
    if (!user) {
      throw new UnauthorizedException(
        this.configService.get<string>('exceptions.unauthorized'),
        'Invalid credentials',
      );
    }

    const isPasswordValid = bcrypt.compareSync(
      loginUserDto.password,
      user[passwordField],
    );

    if (isPasswordValid) {
      delete user[passwordField];

      // Generar tokens
      const accessToken = await this.jwtService.signAsync({ ...user });
      const refreshToken = await this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: authConstants.secret,
          expiresIn: authConstants.expiresIn,
        },
      );

      // Configurar encabezados
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.setHeader('Refresh-Token', refreshToken);

      return res.json({
        message: 'Login successful',
        expires_in: authConstants.convertToUnixTime(authConstants.expiresIn),
        token_type: authConstants.tokenType,
      });
    }
    throw new UnauthorizedException(
      this.configService.get<string>('exceptions.unauthorized'),
      'Invalid credentials',
    );
  }

  async logout(token: string) {
    if (!token) {
      throw new BadRequestException(
        this.configService.get<string>('exceptions.tokenNotProvided'),
        'Token not provided',
      );
    }

    try {
      // Verificar el token
      this.jwtService.verify(token, { secret: authConstants.secret });
      // Aquí podrías agregar lógica para invalidar el token, si es necesario

      return { message: 'Logged out successfully' };
    } catch {
      throw new UnauthorizedException(
        this.configService.get<string>('exceptions.invalidToken'),
      );
    }
  }

  async refreshToken(refreshToken: string, res: Response) {
    try {
      // Verificar y decodificar el refreshToken
      const decoded = this.jwtService.verify(refreshToken, {
        secret: authConstants.secret,
      });
      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException(
          this.configService.get<string>('exceptions.userNotFound'),
        );
      }

      // Generar nuevos tokens
      const newAccessToken = await this.jwtService.signAsync({ sub: user.id });
      const newRefreshToken = await this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: authConstants.secret,
          expiresIn: authConstants.expiresIn,
        },
      );

      // Configurar encabezados
      res.setHeader('Authorization', `Bearer ${newAccessToken}`);
      res.setHeader('Refresh-Token', newRefreshToken);

      return res.status(200).json({ message: 'Token refreshed successfully!' });
    } catch (error) {
      console.error(error.message);
      throw new UnauthorizedException(
        this.configService.get<string>('exceptions.invalidToken'),
        'Invalid refresh token',
      );
    }
  }
}
