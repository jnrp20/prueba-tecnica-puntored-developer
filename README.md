# Portal de Recargas PuntoRed – Prueba Técnica BackEnd Developer -  JUAN NICOLAS ROMERO PINEDA

## Instrucciones de Ejecución

- Requisitos
  Node.js 18+ y npm
  Docker (opcional, si deseas usar la base de dAtos con PostgreSQL)
 
- Instalación (desde la raiz del proyecto) ejecute:
      npm install


- Variables de entorno
  Crear un archivo llamado `.env` en la raiz del proyecto
  Dentro del archivo Copiar y pegar:  
    JWT_SECRET = "pruebaTecnicaBackEnd"
    DB_TYPE=postgres #comentar esta linea si se desea usar sqlite
    DB_HOST=localhost
    DB_PORT=5432
    DB_USERNAME=puntored
    DB_PASSWORD=puntored
    DB_NAME=puntored_db

    
- Ejecutar en desarrollo (con SQLite)
  comentar la variable de entorno DB_TYPE=postgres
  ejecutar el comando `npm run start:dev`
  Se puede consultar la documentacion mediante Swagger en el siguiente endpoint: `http://localhost:3000/docs`


  - Ejecutar en desarrollo (con Postgress)
    Ejecutar el siguiente comando para Levantar Postgres en el docker (desde raiz del proyecto)
    `docker compose up -d`
    Ajustar `.env` con `DB_TYPE=postgres`
    ejecutar el comando `npm run start:dev`


## Librerías Utilizadas

- Backend y framework
  - `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
  - `@nestjs/config` para configuración vía `.env`
  - `@nestjs/swagger` para documentación OpenAPI
- Autenticación
  - `@nestjs/passport`, `passport`, `passport-jwt`
  - `@nestjs/jwt` para firmas de tokens
- Persistencia
  - `typeorm` como ORM
  - `sqlite3` (por defecto)
  - `pg` (bonus PostgreSQL)
- Validación y utilidades
  - `class-validator`, `class-transformer`
  - `bcrypt` para hash de contraseñas
  - `reflect-metadata`, `rxjs`
- Testing
  - `jest`, `@nestjs/testing`, `supertest`, `ts-jest`

## Decisiones Técnicas


- Arquitectura por Capas con DDD por Módulo
  - Separación estricta en `domain/`, `application/` e `infrastructure/` por cada contexto (Users, Auth, Recharges).
  - El dominio define contratos y modelos puros (p. ej., `UserRepository`, `TransactionRepository`, `TokenService`).
  - La aplicación orquesta casos de uso sin detalles técnicos. Se usan clases `*ApplicationService` para dejar claro su rol (p. ej., `UsersApplicationService`, `AuthApplicationService`, `RechargesApplicationService`).
  - La infraestructura implementa detalles (TypeORM, Bcrypt, JWT, Controllers/DTOs bajo `infrastructure/http`).

- Entidades de Infraestructura vs. Entidades de Dominio
  - Separé modelos de dominio de entidades ORM: `UserOrm` y `TransactionOrm` viven en `infrastructure/persistence/` y mapean a tablas (`user_orm`, `transaction_orm`).
  - Ventaja: el dominio no depende de TypeORM y puede evolucionar sin acoplamientos.

- Autenticación JWT en Infraestructura
  - `JwtStrategy` y `JwtTokenService` residen en `auth/infrastructure/` porque son detalles técnicos.
  - La capa de aplicación (`AuthApplicationService`) depende del contrato `TokenService` (dominio), no de `JwtService` directamente.
  - Se añadió extractor robusto de `Bearer <token>` y validaciones de `JWT_SECRET`.

- Validación y Errores
  - Uso de excepciones HTTP semánticas (`ConflictException`, `UnauthorizedException`, `BadRequestException`) en los casos de uso.
  - Reglas de negocio (monto y formato de número) aplicadas en aplicación y/o dominio, con tests que las cubren.

- Configuración de Base de Datos Flexible
  - Por defecto SQLite para ejecución simple.
  - Bonus: PostgreSQL con Docker (`docker-compose.yml`) y selección por `DB_TYPE` en `app.module.ts` mediante `TypeOrmModule.forRootAsync`.
  - Los E2E usan SQLite en memoria para evitar dejar datos en `database.sqlite`.

- Testing
  - Unit tests por módulo (Users, Recharges y Auth) centrados en la lógica de aplicación y contratos de dominio (mocks).
  - E2E test cubre el flujo principal (crear usuario, login, comprar recarga, ver historial, errores).
  - Aislamiento de E2E con DB en memoria para mantener el entorno limpio.
 
## Notas
- Por comodidad para pruebas he decidido implementar un servicio POST para la creacion de usuarios en `http://localhost:3000/users`
- Por cuestiones de documentación he decidido implementar la libreria de Swagger para poder visualizar con mejor claridad cada uno de los servicios
- El swaggger es accesible desde el endpoint `/docs`
- - Las validaciones del numero de telefono  (monto, formato del número)  se hicieron tanto a nivel dto como a nivel dominio
- en el Dto create-recharges.dto.ts se creó un enum para los operadores
  export enum Operator {
  CLARO = 'CLARO',
  MOVISTAR = 'MOVISTAR',
  TIGO = 'TIGO',
  WOM = 'WOM',
  ETB = 'ETB',
  KALLEY_MOVIL = 'KALLEY_MOVIL',
  VIRGIN_MOBILE = 'VIRGIN_MOBILE',
  MOVIL_EXITO = 'MOVIL_EXITO',
  FLASH_MOBILE = 'FLASH_MOBILE',
  LIWA = 'LIWA',
}


## Flujo Recomendado de Pruebas (Orden de Ejecución)

A continuación se describe un flujo típico para probar la API
en los ejemplos uso `http://localhost:3000`. 

### 1. Crear usuario

- Endpoint: `POST /users`
- URL: `http://localhost:3000/users`
- Body (JSON):

```json
{
  "username": "demo_user",
  "password": "demo1234"
}
```

- Respuesta esperada: `201 Created`

```json
{
  "message": "Usuario creado correctamente"
}
```

### 2. Iniciar sesión (login)

- Endpoint: `POST /auth/login`
- URL: `http://localhost:3000/auth/login`
- Body (JSON):

```json
{
  "username": "demo_user",
  "password": "demo1234"
}
```

- Respuesta esperada: `201 Created`

```json
{
  "access_token": "<JWT_TOKEN>"
}
```

Guarda el `access_token`, lo usarás en los siguientes pasos como `Bearer <token>` en el header `Authorization`.

### 3. Realizar una recarga

- Endpoint: `POST /recharges/buy`
- URL: `http://localhost:3000/recharges/buy`
- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`
- Body (JSON):

```json
{
  "phoneNumber": "3001234567",
  "operator": "CLARO",
  "amount": 5000
}
```

- Respuesta esperada: `201 Created` con una transacción:

```json
{
  "id": "<uuid>",
  "phoneNumber": "3001234567",
  "operator": "CLARO",
  "amount": 5000,
  "status": "SUCCESS",
  "createdAt": "<fecha_iso>",
  "userId": "<uuid_usuario>"
}
```

### 4. Consultar historial de recargas

- Endpoint: `GET /recharges/history`
- URL: `http://localhost:3000/recharges/history`
- Headers:
  - `Authorization: Bearer <JWT_TOKEN>`

- Respuesta esperada: `200 OK` con un array de recargas:

```json
[
  {
    "id": "<uuid>",
    "phoneNumber": "3001234567",
    "operator": "CLARO",
    "amount": 5000,
    "status": "SUCCESS",
    "createdAt": "<fecha_iso>",
    "user": {
      "id": "<uuid_usuario>",
      "username": "demo_user"
    }
  }
]
```


