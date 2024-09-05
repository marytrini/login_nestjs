import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UsersService } from 'src/modules/users/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async profile(@Param('id') id: number, @Req() request) {
    const token = request['token'];
    return this.usersService.profile(id, token);
  }
}
