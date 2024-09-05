import { registerAs } from '@nestjs/config';

// Tipos de base de datos permitidos
const validDbTypes = [
  'mysql',
  'mariadb',
  'postgres',
  'cockroachdb',
  'sqlite',
  'mssql',
  'sap',
  'oracle',
  'cordova',
  'nativescript',
  'react-native',
  'sqljs',
  'mongodb',
  'aurora-mysql',
  'aurora-postgres',
  'expo',
  'spanner',
] as const;

type ValidDbType = (typeof validDbTypes)[number];

export default registerAs('config', () => {
  // Obtener el tipo de base de datos desde las variables de entorno
  const dbType = process.env.DB_TYPE as ValidDbType;

  // Validar el tipo de base de datos
  if (!validDbTypes.includes(dbType)) {
    throw new Error(
      `Invalid database type: ${dbType}. Supported types are: ${validDbTypes.join(', ')}`,
    );
  }

  return {
    db: {
      type: dbType,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      name: process.env.DB_DATABASE,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
      dialect: dbType,
      pool_max: parseInt(process.env.DB_POOL_MAX, 10) || 5,
      pool_min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      pool_acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      pool_idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
    },
    fieldMappings: {
      emailField: 'email',
      passwordField: 'password',
    },
  };
});
