import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from '../users/entities/session.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async createSession(userId: number, token: string): Promise<Session> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    const session = this.sessionRepository.create({ user, token });

    return await this.sessionRepository.save(session);
  }

  async invalidateSession(token: string) {
    return await this.sessionRepository.update({ token }, { isActive: false });
  }

  async findValidSession(
    userId: number,
    refreshToken: string,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { user: { id: userId }, token: refreshToken, isActive: true },
      relations: ['user'],
    });

    return session;
  }

  async updateSessionToken(
    sessionId: number,
    newRefreshToken: string,
  ): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId },
    });
    if (session) {
      session.token = newRefreshToken;
      await this.sessionRepository.save(session);
    }
  }
}
