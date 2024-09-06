import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DATABASE_MAPPING_FIELDS',
      useFactory: async (configService: ConfigService) => {
        const dbFields = configService.get('config.fieldMappings');
        return {
          emailField: dbFields.emailField,
          passwordField: dbFields.passwordField,
        };
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DATABASE_MAPPING_FIELDS'],
})
export class SharedModule {}
