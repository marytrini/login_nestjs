import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { SessionService } from './session.service';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User]), SharedModule],
  providers: [
    {
      provide: 'SESSION_REPOSITORY',
      useClass: Repository,
    },
    {
      provide: 'USER_REPOSITORY',
      useClass: Repository,
    },
    SessionService,
  ],
  exports: [SessionService],
})
export class SessionModule {}
