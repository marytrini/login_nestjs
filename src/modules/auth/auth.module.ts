import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { authConstants } from './utils/constants';
import { Session } from '../../modules/session/entities/session.entity';
import { SessionService } from '../session/session.service';
import { SessionModule } from '../session/session.module';
import { JwtStrategy } from './jwtStrategy';
import { JwtAuthGuard } from './auth.guard';
import { ExtractTokenMiddleware } from 'src/middlewares/extract-token.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    JwtModule.register({
      global: true,
      secret: authConstants.secret,
      signOptions: { expiresIn: authConstants.expiresIn },
    }),
    SessionModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtractTokenMiddleware).forRoutes(AuthController);
  }
}
