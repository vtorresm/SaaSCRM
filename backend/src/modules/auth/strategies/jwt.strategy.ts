import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload) {
        // Aquí validamos que el usuario existe y está activo
        const user = await this.authService.findUserById(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        // Verificar que el usuario esté activo
        if (user.status === 'SUSPENDED') {
            throw new UnauthorizedException('Usuario suspendido');
        }

        if (user.status === 'INACTIVE') {
            throw new UnauthorizedException('Usuario inactivo');
        }

        // Verificar que la cuenta no esté bloqueada
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new UnauthorizedException('Cuenta bloqueada temporalmente');
        }

        // El objeto retornado será adjuntado al request como req.user
        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            firstName: user.firstName,
            lastName: user.lastName,
            status: user.status,
            lastLoginAt: user.lastLoginAt,
            lockedUntil: user.lockedUntil,
        };
    }
}