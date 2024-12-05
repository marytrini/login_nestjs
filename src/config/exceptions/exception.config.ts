import { registerAs } from '@nestjs/config';

export default registerAs('exceptions', () => ({
  userNotFound:
    process.env.EXCEPTION_USER_NOT_FOUND || 'Usuario no encontrado.',
  invalidToken: process.env.EXCEPTION_INVALID_TOKEN || 'Token inválido.',
  tokenNotProvided: process.env.EXCEPTION_BAD_REQUEST,
  unauthorized: process.env.EXCEPTION_UNAUTHORIZED || 'Acceso no autorizado.',
  genericError:
    process.env.EXCEPTION_GENERIC_ERROR || 'Se produjo un error inesperado.',
  mailConflict: process.env.MAIL_CONFLICT_EXCEPTION,
  passwordConflict: process.env.PASSWORD_CONFLICT_EXCEPTION,
}));
