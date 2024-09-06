import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  Session,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../users/users.controller';
import { UsersService } from 'src/modules/users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { SessionModule } from '../session/session.module';
import { ExtractTokenMiddleware } from '../../middlewares/extract-token.middleware';
import { SessionService } from '../session/session.service';
import { DynamicConfigModule } from '../dynamic-config/dynamic-config.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    DynamicConfigModule,
    SharedModule,
    //SessionModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService, SessionService],
  exports: [UsersService],
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExtractTokenMiddleware)
      .forRoutes({ path: 'users/:identity', method: RequestMethod.GET });
  }
}
