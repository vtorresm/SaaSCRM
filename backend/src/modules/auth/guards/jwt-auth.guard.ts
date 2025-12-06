import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        // Si hay un error, lo lanzamos
        if (err || !user) {
            throw err || new UnauthorizedException('Token inválido o expirado');
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

        // Adjuntar información adicional al request
        return {
            ...user,
            ip: context.switchToHttp().getRequest().ip,
            userAgent: context.switchToHttp().getRequest().headers['user-agent'],
        };
    }
}