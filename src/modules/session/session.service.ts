import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Session } from './entities/session.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @Inject('SESSION_REPOSITORY')
    private sessionRepository: Repository<Session>,
    @Inject('USER_REPOSITORY')
    private usersRepository: Repository<User>,
  ) {}

  async createSession(userId: number, token: string): Promise<Session> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const sessionExists = await this.sessionRepository.findOne({
      where: { user: { id: userId }, isActive: true },
    });

    if (sessionExists) {
      throw new UnauthorizedException('El usuario ya tiene una sesión activa.');
    }

    const session = this.sessionRepository.create({ user, token });

    return await this.sessionRepository.save(session);
  }

  async invalidateSession(token: string): Promise<void> {
    await this.sessionRepository.update({ token }, { isActive: false });
  }

  async findValidSession(
    userId: number,
    refreshToken: string,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId }, token: refreshToken, isActive: true },
      relations: ['user'],
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
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    session.token = newRefreshToken;
    await this.sessionRepository.save(session);
  }
}
