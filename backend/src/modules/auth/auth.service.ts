import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Throttle } from '@nestjs/throttler';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        status: string;
    };
    accessToken: string;
    refreshToken: string;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Genera tokens JWT (access y refresh)
     */
    async generateTokens(user: any): Promise<AuthResponse> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
            },
            accessToken,
            refreshToken,
        };
    }

    /**
     * Hash de contraseña con bcrypt
     */
    async hashPassword(password: string): Promise<string> {
        const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS') || 12;
        return bcrypt.hash(password, saltRounds);
    }

    /**
     * Valida contraseña
     */
    async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    /**
     * Rotación de tokens - invalida refresh token anterior
     */
    async rotateTokens(userId: string, refreshToken: string): Promise<AuthResponse> {
        // Aquí implementaríamos lógica de invalidación del refresh token anterior
        // Por ahora generamos nuevos tokens

        // En una implementación completa, validaríamos que el refresh token sea válido
        // y no haya sido usado (revocation list o base de datos)

        // Simular búsqueda de usuario
        const user = await this.findUserById(userId);
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        return this.generateTokens(user);
    }

    /**
     * Valida usuario para estrategia local
     */
    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.findUserByEmail(email);

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Verificar si el usuario está bloqueado
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const remainingMinutes = Math.ceil(
                (user.lockedUntil.getTime() - Date.now()) / (1000 * 60)
            );
            throw new UnauthorizedException(
                `Cuenta bloqueada. Intente nuevamente en ${remainingMinutes} minutos`
            );
        }

        // Verificar contraseña
        const isPasswordValid = await this.validatePassword(password, user.password);

        if (!isPasswordValid) {
            await this.handleFailedLoginAttempt(user.id);
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // Resetear contador de intentos fallidos
        await this.resetFailedLoginAttempts(user.id);

        return user;
    }

    /**
     * Maneja intentos de login fallidos
     */
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
    private async handleFailedLoginAttempt(userId: string): Promise<void> {
        const maxAttempts = this.configService.get<number>('MAX_LOGIN_ATTEMPTS') || 5;
        const lockoutTime = this.configService.get<number>('ACCOUNT_LOCKOUT_TIME') || 30; // minutos

        // Aquí incrementaríamos el contador de intentos fallidos
        // y bloquearíamos la cuenta si es necesario

        console.log(`Failed login attempt for user ${userId}`);
    }

    /**
     * Resetea contador de intentos fallidos
     */
    private async resetFailedLoginAttempts(userId: string): Promise<void> {
        // Aquí reseteamos el contador de intentos fallidos
        console.log(`Reset failed attempts for user ${userId}`);
    }

    /**
     * Busca usuario por email (mock)
     */
    private async findUserByEmail(email: string): Promise<any> {
        // Aquí implementaríamos búsqueda real en base de datos
        // Retornamos null por ahora
        return null;
    }

    /**
     * Busca usuario por ID (mock)
     */
    async findUserById(id: string): Promise<any> {
        // Aquí implementaríamos búsqueda real en base de datos
        // Retornamos null por ahora
        return null;
    }

    /**
     * Verifica si un token es válido
     */
    async validateToken(token: string): Promise<JwtPayload> {
        try {
            return this.jwtService.verify(token);
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }

    /**
     * Registra un nuevo usuario
     */
    async register(userData: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role?: string;
    }): Promise<AuthResponse> {
        // Verificar si el usuario ya existe
        const existingUser = await this.findUserByEmail(userData.email);
        if (existingUser) {
            throw new BadRequestException('El usuario ya existe');
        }

        // Hash de la contraseña
        const hashedPassword = await this.hashPassword(userData.password);

        // Crear usuario
        const newUser = {
            id: 'mock-id',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role || 'SALES_REP',
            status: 'PENDING_VERIFICATION',
            password: hashedPassword,
        };

        // Aquí guardaríamos en base de datos
        console.log('Creating user:', newUser);

        return this.generateTokens(newUser);
    }

    /**
     * Actualiza último login
     */
    async updateLastLogin(userId: string): Promise<void> {
        // Aquí actualizaríamos el timestamp de último login
        console.log(`Updated last login for user ${userId}`);
    }
}