import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dto/registerUserDto.dto';
import { SessionService } from '../session/session.service';
import { DatabaseMappingFields } from '../../config/interfaces/database-config.interface';
import { User } from './entities/user.entity';
import { InjectEntityManager } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @Inject('DATABASE_MAPPING_FIELDS')
    private readonly dbMappingFields: DatabaseMappingFields,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,

    private sessionService: SessionService,
  ) {}
  async getUserRepository(): Promise<Repository<any>> {
    const userEntity = this.dbMappingFields.userEntity || 'User';
    return this.entityManager.getRepository(userEntity);
  }

  async getSessionRepository(): Promise<Repository<any>> {
    const sessionEntity = this.dbMappingFields.sessionEntity || 'Session';
    return this.entityManager.getRepository(sessionEntity);
  }
  async register(registerUserDto: RegisterUserDto) {
    const emailField = this.dbMappingFields.emailField;
    const passwordField = this.dbMappingFields.passwordField;
    const userRepository = await this.getUserRepository();

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

    const newUser = userRepository.create({
      [emailField]: registerUserDto.email,
      [passwordField]: bcrypt.hashSync(registerUserDto.password, 10),
    });

    const user = await userRepository.save(newUser);
    delete user[passwordField];
    return user;
  }

  async findByField(field: string, value: string): Promise<any | undefined> {
    const userRepository = await this.getUserRepository();
    return userRepository.findOne({ where: { [field]: value } });
  }

  async findById(id: number): Promise<any> {
    const userRepository = await this.getUserRepository();
    const user = await userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }
    return user;
  }

  async findAll(): Promise<any[]> {
    const userRepository = await this.getUserRepository();
    return userRepository.find();
  }

  async findByTokenData(tokenData: any): Promise<any | undefined> {
    const userRepository = await this.getUserRepository();
    return await userRepository.findOne({
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
