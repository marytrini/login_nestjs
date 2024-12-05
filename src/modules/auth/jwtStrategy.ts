import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { authConstants } from '../auth/utils/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log('jwtPayload:', payload);
    if (!payload) {
      console.log('Invalid Token');

      throw new UnauthorizedException('Invalid token');
    }
    return { id: payload.sub, email: payload.email };
  }
}
