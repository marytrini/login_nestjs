import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { authConstants } from 'src/modules/auth/utils/constants';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtAuthGuard } from './auth.guard';
import { JwtStrategy } from './jwtStrategy';
import { DynamicConfigModule } from '../dynamic-config/dynamic-config.module';
import { ExtractTokenMiddleware } from '../../middlewares/extract-token.middleware';
import { UsersModule } from '../users/users.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
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
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  exports: [AuthService, JwtStrategy, JwtAuthGuard],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ExtractTokenMiddleware).forRoutes(
      {
        path: 'auth/logout',
        method: RequestMethod.POST,
      },
      { path: 'users/:identity', method: RequestMethod.GET },
    );
  }
}
