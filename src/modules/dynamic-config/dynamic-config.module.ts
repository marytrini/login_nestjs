import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DatabaseMappingFields } from '../../config/interfaces/database-config.interface';
import { UserRepositoryProvider } from '../../config/providers/user-repository.provider';
import { SessionRepositoryProvider } from '../../config/providers/session-repository.provider';

@Global()
@Module({})
export class DynamicConfigModule {
  static forRoot(
    config: DatabaseMappingFields,
    entities: { userEntity: new () => any; sessionEntity: new () => any }, // Aquí esperas clases (constructores)
  ): DynamicModule {
    const userRepoProvider = UserRepositoryProvider(entities.userEntity);
    const sessionRepoProvider = SessionRepositoryProvider(
      entities.sessionEntity,
    );

    return {
      module: DynamicConfigModule,
      providers: [
        {
          provide: 'DATABASE_MAPPING_FIELDS',
          useValue: config,
        },
        userRepoProvider,
        sessionRepoProvider,
      ],
      exports: [
        'DATABASE_MAPPING_FIELDS',
        'USER_REPOSITORY',
        'SESSION_REPOSITORY',
      ],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<DatabaseMappingFields> | DatabaseMappingFields;
    inject?: any[];
    entities: { userEntity: new () => any; sessionEntity: new () => any };
  }): DynamicModule {
    const asyncProviders: Provider[] = [
      {
        provide: 'DATABASE_MAPPING_FIELDS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      UserRepositoryProvider(options.entities.userEntity),
      SessionRepositoryProvider(options.entities.sessionEntity),
    ];

    return {
      module: DynamicConfigModule,
      imports: options.imports,
      providers: asyncProviders,
      exports: asyncProviders,
    };
  }
}
