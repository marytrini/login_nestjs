<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Package Library</title>
</head>
<body>
  <h1>Login Package Library</h1>
  <p>
    Una librería para el manejo de login de usuarios con configuración dinámica que se adapta al entorno del repositorio donde se instala. 
    Está diseñada para integrarse fácilmente con proyectos basados en NestJS y utiliza tecnologías modernas para la autenticación y la seguridad.
  </p>

  <h2>Tecnologías utilizadas</h2>
  <ul>
    <li><strong>Backend Framework</strong>: NestJS</li>
    <li><strong>Lenguaje</strong>: TypeScript</li>
    <li><strong>Base de Datos</strong>: MySQL</li>
    <li><strong>Librerías</strong>:
      <ul>
        <li><code>bcrypt</code> para hashing de contraseñas.</li>
        <li><code>jsonwebtoken (jwt)</code> para la generación y verificación de tokens.</li>
        <li><code>passport</code> para la gestión de estrategias de autenticación.</li>
      </ul>
    </li>
  </ul>

  <h2>Instalación</h2>

  <h3>Paso 1: Instalar el paquete</h3>
  <p>Con npm:</p>
  <pre><code>npm i @marytrini/login_package</code></pre>
  <p>Con Yarn:</p>
  <pre><code>yarn add @marytrini/login_package</code></pre>

  <h3>Paso 2: Configurar el archivo <code>.npmrc</code></h3>
  <p>Asegúrate de añadir un archivo <code>.npmrc</code> en la raíz de tu proyecto con la configuración adecuada para acceder al paquete.</p>

  <h3>Paso 3: Configurar las variables de entorno</h3>
  <p>Define las variables necesarias en tu archivo de entorno <code>.env</code>. Un ejemplo de configuración sería:</p>
  <pre><code>
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=securepassword
DB_DATABASE=login_db
DB_PORT=3306
DB_DIALECT=mysql
DB_POOL_MAX=10
DB_POOL_MIN=1
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
  </code></pre>

  <h2>Uso</h2>

  <h3>1. Añadir el módulo al archivo <code>AppModule</code></h3>
  <p>En tu aplicación NestJS, importa el módulo del paquete y añádelo a tu archivo <code>AppModule</code>:</p>
  <pre><code>
import { Module } from '@nestjs/common';
import { LoginModule } from '@marytrini/login_package';

@Module({
  imports: [
    LoginModule,
    // otros módulos
  ],
})
export class AppModule {}
  </code></pre>

  <h3>2. Requerir los métodos donde sea necesario</h3>
  <p>Importa y utiliza los métodos disponibles en la librería para implementar la lógica de autenticación en las partes necesarias de tu aplicación.</p>
  <pre><code>
import { AuthService } from '@marytrini/login_package';

// ejemplo de uso
export class UserService {
  constructor(private readonly authService: AuthService) {}

  async validateUser(loginDto: LoginDto) {
    return this.authService.validateUser(loginDto);
  }
}
  </code></pre>

  <h2>Configuración Dinámica</h2>
  <p>
    La configuración de la librería es completamente dinámica y se ajusta a las variables de entorno definidas. 
    Asegúrate de incluir una función de configuración en tu archivo <code>configuration.ts</code>:
  </p>
  <pre><code>
export default () => ({
  db: {
    type: 'mysql',
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT,
    pool_max: process.env.DB_POOL_MAX,
    pool_min: process.env.DB_POOL_MIN,
    pool_acquire: process.env.DB_POOL_ACQUIRE,
    pool_idle: process.env.DB_POOL_IDLE,
  },
});
  </code></pre>

  <h2>Ejecución</h2>
  <ol>
    <li>Inicia tu proyecto de manera habitual (<code>npm start</code>, <code>yarn start</code>, etc.).</li>
    <li>La librería estará lista para manejar el login de usuarios según la configuración dinámica proporcionada.</li>
  </ol>

  <h2>Contribuciones y Soporte</h2>
  <p>
    Si encuentras algún problema o deseas contribuir a la librería, por favor, abre un issue en el repositorio del paquete en GitLab. 
    ¡Gracias por usar nuestra solución! 😊
  </p>
</body>
</html>
