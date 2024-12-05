import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  Res,
  Get,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginUserDto } from 'src/modules/auth/dto/loginUserDto.dto';
import { RegisterUserDto } from 'src/modules/users/dto/registerUserDto.dto';
import { UsersService } from 'src/modules/users/users.service';
import { RefreshTokenDto } from '../auth/dto/refreshTokenDto.dto';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    return this.authService.login(loginUserDto, res);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() request) {
    const token = request['token'];
    return this.authService.logout(token);
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res() res: Response,
  ) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken, res);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request) {
    const user = req.user; // user debería contener los datos del usuario decodificados del JWT
    
    return this.usersService.profile(user.id, req.headers['authorization'])
  }
}
