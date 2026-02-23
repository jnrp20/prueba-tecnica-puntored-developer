import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RechargesModule } from './recharges/recharges.module';
import { UserOrm } from './users/infrastructure/persistence/user.orm-entity';
import { TransactionOrm } from './recharges/infrastructure/persistence/transaction.orm-entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<'sqlite' | 'postgres'>('DB_TYPE', 'sqlite');

        if (dbType === 'postgres') {
          return {
            type: 'postgres' as const,
            host: config.get<string>('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get<string>('DB_USERNAME', 'puntored'),
            password: config.get<string>('DB_PASSWORD', 'puntored'),
            database: config.get<string>('DB_NAME', 'puntored_db'),
            entities: [UserOrm, TransactionOrm],
            synchronize: true,
          };
        }

        return {
          type: 'sqlite' as const,
          database: config.get<string>('DB_SQLITE_PATH', 'database.sqlite'),
          entities: [UserOrm, TransactionOrm],
          synchronize: true,
        };
      },
    }),
    UsersModule,
    AuthModule,
    RechargesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
