import { Provider } from '@nestjs/common';
import { Connection, Repository } from 'typeorm';

export const SessionRepositoryProvider = <T>(
  entity: new () => T,
): Provider => ({
  provide: 'USER_REPOSITORY',
  useFactory: (connection: Connection): Repository<T> => {
    return connection.getRepository(entity);
  },
  inject: [Connection],
});
