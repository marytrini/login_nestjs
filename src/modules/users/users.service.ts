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
import { DatabaseMappingFields } from '../../config/interfaces/database-config.interface';
import { User } from './entities/user.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { authConstants } from '../auth/utils/constants';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,

    @Inject('DATABASE_MAPPING_FIELDS')
    private readonly dbMappingFields: DatabaseMappingFields,

    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}
  async getUserRepository(): Promise<Repository<any>> {
    const userEntity = this.dbMappingFields.userEntity || 'User';
    return this.entityManager.getRepository(userEntity);
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
      throw new ConflictException(
        this.configService.get<string>('exceptions.mailConflict'),
      );
    }
    if (registerUserDto.password !== registerUserDto.password_confirmation) {
      throw new ConflictException(
        this.configService.get<string>('exceptions.passwordConflict'),
      );
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
      throw new NotFoundException(
        this.configService.get<string>('exceptions.userNotFound'),
      );
    }
    return user;
  }

  async findAll(): Promise<any[]> {
    const userRepository = await this.getUserRepository();
    return userRepository.find();
  }

  async findByTokenData(tokenData: any): Promise<any | undefined> {
    const emailField = this.dbMappingFields.emailField;
    const userRepository = await this.getUserRepository();
    return await userRepository.findOne({
      where: { [emailField]: tokenData.email },
    });
  }

  async updateToken(
    userId: number,
    accessToken: string,
    tokenExpiration: Date,
  ) {
    const userRepository = await this.getUserRepository();
    await userRepository.update(userId, { accessToken, tokenExpiration });
  }

  async clearToken(userId: number) {
    const userRepository = await this.getUserRepository();
    await userRepository.update(userId, {
      accessToken: null,
      tokenExpiration: null,
    });
  }

  async profile(userId: number, authHeader: string): Promise<User> {
    const passwordField = this.dbMappingFields.passwordField;
    const userRepository = await this.getUserRepository();
    const user = await userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(
        this.configService.get<string>('exceptions.userNotFound'),
        `Usuario con id ${userId} no encontrado`,
      );
    }

    const token = authHeader && authHeader.replace('Bearer ', '');

    try {
      this.jwtService.verify(token, { secret: authConstants.secret });
    } catch {
      throw new UnauthorizedException(
        this.configService.get<string>('exceptions.invalidToken'),
      );
    }

    delete user[passwordField];

    return user;
  }
}
