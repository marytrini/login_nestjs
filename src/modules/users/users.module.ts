import { Module, Session } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from '../users/users.controller';
import { UsersService } from 'src/modules/users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { DynamicConfigModule } from '../dynamic-config/dynamic-config.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Session]),
    DynamicConfigModule,
    SharedModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, AuthService],
  exports: [UsersService],
})
export class UsersModule {}
