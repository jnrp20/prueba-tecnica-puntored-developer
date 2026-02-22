import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RechargesModule } from './recharges/recharges.module';
import { User } from './users/user.entity';
import { Transaction } from './recharges/transaction.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [User, Transaction],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    RechargesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
