import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { authConstants } from './utils/constants';
import { Session } from '../../modules/session/entities/session.entity';
import { JwtStrategy } from './jwtStrategy';
import { JwtAuthGuard } from './auth.guard';
import { ExtractTokenMiddleware } from 'src/middlewares/extract-token.middleware';
import { DynamicConfigModule } from '../dynamic-config/dynamic-config.module';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../shared/shared.module';
import { SessionService } from '../session/session.service';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    JwtModule.register({
      global: true,
      secret: authConstants.secret,
      signOptions: { expiresIn: authConstants.expiresIn },
    }),
    DynamicConfigModule,
    SharedModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, SessionService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ExtractTokenMiddleware)
      .forRoutes({ path: 'auth/logout', method: RequestMethod.POST });
  }
}
