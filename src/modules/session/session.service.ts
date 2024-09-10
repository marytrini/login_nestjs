import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';
import { DatabaseMappingFields } from 'src/config/interfaces/database-config.interface';
import { InjectEntityManager } from '@nestjs/typeorm';

@Injectable()
export class SessionService {
  constructor(
    @Inject('DATABASE_MAPPING_FIELDS')
    private readonly dbMappingFields: DatabaseMappingFields,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}
  async getUserRepository(): Promise<Repository<any>> {
    const userEntity = this.dbMappingFields.userEntity || 'User';
    return this.entityManager.getRepository(userEntity);
  }

  async getSessionRepository(): Promise<Repository<any>> {
    const sessionEntity = this.dbMappingFields.sessionEntity || 'Session';
    return this.entityManager.getRepository(sessionEntity);
  }

  async createSession(userId: number, token: string): Promise<any> {
    const userRepository = await this.getUserRepository();
    const sessionsRepository = await this.getSessionRepository();
    const userField = this.dbMappingFields.userField || 'user';

    if (!userField) {
      throw new Error('El campo userField no está definido en dbMappingFields');
    }

    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const sessionExists = await sessionsRepository.findOne({
      where: { [userField]: { id: userId }, isActive: true },
    });

    if (sessionExists) {
      throw new UnauthorizedException('El usuario ya tiene una sesión activa.');
    }

    const session = sessionsRepository.create({ [userField]: user, token });

    return await sessionsRepository.save(session);
  }

  async invalidateSession(token: string): Promise<void> {
    const sessionsRepository = await this.getSessionRepository();
    await sessionsRepository.update({ token }, { isActive: false });
  }

  async findValidSession(userId: number, refreshToken: string): Promise<any> {
    const userField = this.dbMappingFields.userField || 'user';
    const sessionsRepository = this.getSessionRepository();
    const session = (await sessionsRepository).findOne({
      where: {
        [userField]: { id: userId },
        token: refreshToken,
        isActive: true,
      },
      relations: [userField],
    });

    if (!session) {
      throw new UnauthorizedException('Sesión no válida o expirada');
    }

    return session;
  }

  async updateSessionToken(
    sessionId: number,
    newRefreshToken: string,
  ): Promise<void> {
    const sessionsRepository = await this.getSessionRepository();
    const session = await sessionsRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    session.token = newRefreshToken;
    await sessionsRepository.save(session);
  }
}
