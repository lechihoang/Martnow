import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          const authHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
          const cookieToken = request?.cookies?.accessToken;
          return authHeader || cookieToken;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = { 
      userId: payload.sub, 
      username: payload.username,
      role: payload.role
    };
    return user;
  }
}