import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './modules/auth/auth.service';
import { UsersService } from './modules/users/users.service';
import { User } from './modules/users/entities/user.entity';
import { AuthController } from './modules/auth/auth.controller';
import { UsersController } from './modules/users/users.controller';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/modules/**/entities/*.entity{.ts,.js}'], // Importa todas las entidades
      synchronize: true, // Solo en desarrollo
    }),
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'dist') }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController, AuthController, UsersController],
  providers: [AppService, AuthService, UsersService],
})
export class AppModule {}
