import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../users/entities/session.entity';
import { SessionService } from './session.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User])],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
