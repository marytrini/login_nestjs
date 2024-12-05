import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/users/entities/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import configuration from './config/configuration';
import { DynamicConfigModule } from './modules/dynamic-config/dynamic-config.module';
import { SharedModule } from './modules/shared/shared.module';
import exceptionConfig from './config/exceptions/exception.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration, exceptionConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('config.db');
        return {
          type: dbConfig.type as any,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.name,
          entities: [User],
          synchronize: false,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    DynamicConfigModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const dbFields = configService.get('config.fieldMappings');
        console.log('Field Mappings from ConfigService:', dbFields);
        return {
          emailField: dbFields.emailField,
          passwordField: dbFields.passwordField,
          userField: dbFields.userField,
          userEntity: dbFields.userEntity,
        };
      },
      inject: [ConfigService],
      entities: {
        userEntity: User,
      },
    }),

    SharedModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
