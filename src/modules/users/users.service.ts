import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/registerUserDto.dto';
import { SessionService } from '../session/session.service';
import { DatabaseMappingFields } from '../../config/interfaces/database-config.interface';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_MAPPING_FIELDS')
    private readonly dbMappingFields: DatabaseMappingFields,

    @Inject('USER_REPOSITORY') // Inyecta el repositorio dinámicamente
    private usersRepository: Repository<User>,

    private sessionService: SessionService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const emailField = this.dbMappingFields.emailField;
    const passwordField = this.dbMappingFields.passwordField;

    const userExists = await this.findByField(
      emailField,
      registerUserDto.email,
    );

    if (userExists) {
      throw new ConflictException('El correo ya está en uso');
    }
    if (registerUserDto.password !== registerUserDto.password_confirmation) {
      throw new ConflictException('Las contraseñas no coinciden');
    }

    const newUser = this.usersRepository.create({
      [emailField]: registerUserDto.email,
      [passwordField]: bcrypt.hashSync(registerUserDto.password, 10),
    });

    const user = await this.usersRepository.save(newUser);
    delete user[passwordField];
    return user;
  }

  async findByField(field: string, value: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { [field]: value } });
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findByTokenData(tokenData: any): Promise<User | undefined> {
    return await this.usersRepository.findOne({
      where: { email: tokenData.email },
    });
  }

  async profile(userId: number, token: string): Promise<User> {
    const validSession = await this.sessionService.findValidSession(
      userId,
      token,
    );
    if (!validSession) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `Usuario con los datos proporcionados no encontrado`,
      );
    }

    const passwordField = this.dbMappingFields.passwordField;
    delete user[passwordField];
    return user;
  }
}
