import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrm } from './infrastructure/persistence/user.orm-entity';
import { UsersApplicationService } from './application/users-application.service';
import { UsersController } from './infrastructure/http/users.controller';
import { UserRepository } from './domain/user.repository';
import { PasswordHasher } from './domain/password-hasher';
import { TypeOrmUserRepository } from './infrastructure/typeorm-user.repository';
import { BcryptPasswordHasher } from './infrastructure/bcrypt-password-hasher';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrm])],
  providers: [
    UsersApplicationService,
    {
      provide: UserRepository,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: PasswordHasher,
      useClass: BcryptPasswordHasher,
    },
  ],
  controllers: [UsersController],
  exports: [UsersApplicationService],
})
export class UsersModule {}
