import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../decorators/current-user.decorator';

const ACTIVE_USER_IDS = new Set(['1', '2', '3', '4']);

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload & { sub: string }) {
    if (!ACTIVE_USER_IDS.has(payload.sub)) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      appContext: payload.appContext,
    };
  }
}
