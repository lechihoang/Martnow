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
          // Ưu tiên đọc từ HTTP-only cookie
          const cookieToken = request?.cookies?.access_token;
          // Fallback to Authorization header for API clients
          const authHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
          return cookieToken || authHeader;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      id: payload.sub, // For compatibility
      username: payload.username,
      email: payload.email,
      role: payload.role,
    };
  }
}
