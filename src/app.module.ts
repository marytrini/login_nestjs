import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { SessionModule } from './modules/session/session.module';
import { Session } from './modules/session/entities/session.entity';
import configuration from './config/configuration';
import { DynamicConfigModule } from './modules/dynamic-config/dynamic-config.module';
import { SharedModule } from './modules/shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('config.db');
        console.log('Database Configuration:', dbConfig);
        return {
          type: dbConfig.type as any,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [User, Session],
          synchronize: false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Session]),
    DynamicConfigModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbFields = configService.get('config.fieldMappings');
        return {
          emailField: dbFields.emailField,
          passwordField: dbFields.passwordField,
          userField: dbFields.userField,
          userEntity: dbFields.userEntity,
          sessionEntity: dbFields.sessionEntity,
        };
      },
      inject: [ConfigService],
      entities: {
        userEntity: User,
        sessionEntity: Session,
      },
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    SessionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
