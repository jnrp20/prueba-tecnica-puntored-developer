import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthApplicationService } from './application/auth-application.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './infrastructure/http/auth.controller';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { TokenService } from './application/token.service';
import { JwtTokenService } from './infrastructure/jwt-token.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error('JWT_SECRET env variable is not defined');
        }
        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  providers: [
    AuthApplicationService,
    JwtStrategy,
    JwtTokenService,
    {
      provide: TokenService,
      useClass: JwtTokenService,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
