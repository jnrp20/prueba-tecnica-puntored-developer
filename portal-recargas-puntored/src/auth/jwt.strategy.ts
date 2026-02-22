import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import type { JwtFromRequestFunction, StrategyOptions } from 'passport-jwt';
import type { Request } from 'express';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const jwtExtractor: JwtFromRequestFunction = (req: Request | undefined) => {
      if (!req) return null;
      const authHeader = req.headers?.authorization;
      if (typeof authHeader !== 'string') return null;
      const parts = authHeader.split(' ');
      if (parts.length !== 2) return null;
      const [scheme, token] = parts;
      if (scheme.toLowerCase() !== 'bearer' || !token) return null;
      return token;
    };

    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET env variable is not defined');
    }

    const options: StrategyOptions = {
      jwtFromRequest: jwtExtractor,
      ignoreExpiration: false,
      secretOrKey: secret,
    };

    super(options);
  }

  validate(payload: JwtPayload) {
    return { userId: payload.sub, username: payload.username };
  }
}
