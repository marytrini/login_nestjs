import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterUserDto } from './dto/registerUserDto.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const userExists = await this.findByEmail(registerUserDto.email);

    if (userExists) {
      throw new ConflictException('El correo ya está en uso');
    }
    if (registerUserDto.password !== registerUserDto.confirm_password) {
      throw new ConflictException('Las contraseñas no coinciden');
    }
    const newUser = await this.usersRepository.create(registerUserDto);
    newUser.password = bcrypt.hashSync(newUser.password, 10);

    const user = await this.usersRepository.save(newUser);
    delete user.password;

    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepository
      .createQueryBuilder('user')
      .where('user.email= :email', { email })
      .getOne();
  }

  async findById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();
    return users;
  }
}
