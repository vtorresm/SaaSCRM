import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
    constructor(private throttlerGuard: ThrottlerGuard) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Primero verificar rate limiting
        const canActivate = await this.throttlerGuard.canActivate(context);

        if (!canActivate) {
            throw new UnauthorizedException('Demasiados intentos de login. Intente más tarde.');
        }

        // Luego proceder con la autenticación local
        const result = await super.canActivate(context);
        return !!result;
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext): any {
        // Si hay un error de validación de entrada
        if (err) {
            throw err;
        }

        // Si no se pudo autenticar con las credenciales
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
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
            const remainingMinutes = Math.ceil(
                (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
            );
            throw new UnauthorizedException(
                `Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos`
            );
        }

        // Verificar que el email esté verificado
        if (!user.emailVerified) {
            throw new UnauthorizedException('Debe verificar su email antes de iniciar sesión');
        }

        return user;
    }
}