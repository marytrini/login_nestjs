import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DatabaseMappingFields } from 'src/config/interfaces/database-config.interface';
import { UserRepositoryProvider } from 'src/config/providers/user-repository.provider';

@Global()
@Module({})
export class DynamicConfigModule {
  static forRoot(
    config: DatabaseMappingFields,
    entities: { userEntity: new () => any },
  ): DynamicModule {
    const userRepoProvider = UserRepositoryProvider(entities.userEntity);
    console.log('Config being injected:', config);
    return {
      module: DynamicConfigModule,
      providers: [
        {
          provide: 'DATABASE_MAPPING_FIELDS',
          useValue: config,
        },
        userRepoProvider,
      ],
      exports: ['DATABASE_MAPPING_FIELDS', 'USER_REPOSITORY'],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<DatabaseMappingFields> | DatabaseMappingFields;
    inject?: any[];
    entities: { userEntity: new () => any };
  }): DynamicModule {
    const asyncProviders: Provider[] = [
      {
        provide: 'DATABASE_MAPPING_FIELDS',
        useFactory: async (...args) => {
          const result = await options.useFactory(...args);
          console.log('Async Config being injected:', result);
          return result;
        },
        inject: options.inject || [],
      },
      UserRepositoryProvider(options.entities.userEntity),
    ];
    return {
      module: DynamicConfigModule,
      imports: options.imports,
      providers: asyncProviders,
      exports: asyncProviders,
    };
  }
}
