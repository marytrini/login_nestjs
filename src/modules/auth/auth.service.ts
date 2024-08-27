import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../users/dto/loginUserDto.dto';
import * as bcrypt from 'bcrypt';
import { log } from 'console';
import { authConstants } from './utils/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
      return {
        access_token: await this.jwtService.signAsync({ ...user }),
        expires_in: authConstants.convertToUnixTime(authConstants.expiresIn),
        token_type: authConstants.tokenType,
      };
    }
    throw new UnauthorizedException();
  }
}
