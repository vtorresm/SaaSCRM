import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService, AuthResponse } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registrar nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o usuario ya existe' })
    async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
    @ApiOperation({ summary: 'Iniciar sesión' })
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    @ApiResponse({ status: 429, description: 'Demasiados intentos' })
    async login(@Body() loginDto: LoginDto, @Request() req): Promise<AuthResponse> {
        const authResponse = await this.authService.generateTokens(req.user);
        await this.authService.updateLastLogin(req.user.id);
        return authResponse;
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Renovar token de acceso' })
    @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
    @ApiResponse({ status: 401, description: 'Refresh token inválido' })
    async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
        // Validar refresh token
        const payload = await this.authService.validateToken(refreshTokenDto.refreshToken);
        return this.authService.rotateTokens(payload.sub, refreshTokenDto.refreshToken);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Cerrar sesión' })
    @ApiResponse({ status: 200, description: 'Logout exitoso' })
    async logout(@Request() req): Promise<{ message: string }> {
        // Aquí invalidaríamos el refresh token en la base de datos
        // Por ahora simplemente retornamos confirmación
        return { message: 'Logout exitoso' };
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
    @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
    @ApiResponse({ status: 401, description: 'No autenticado' })
    async getProfile(@Request() req): Promise<{ user: any }> {
        return {
            user: {
                id: req.user.id,
                email: req.user.email,
                firstName: req.user.firstName,
                lastName: req.user.lastName,
                role: req.user.role,
                status: req.user.status,
                lastLoginAt: req.user.lastLoginAt,
            },
        };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 intentos cada 5 minutos
    @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
    @ApiResponse({ status: 200, description: 'Si el email existe, se enviará un enlace' })
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
        // Aquí implementaríamos el envío de email con enlace de restablecimiento
        console.log('Password reset requested for:', forgotPasswordDto.email);

        return {
            message: 'Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña.',
        };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Restablecer contraseña con token' })
    @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente' })
    @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
        // Aquí validaríamos el token y actualizaríamos la contraseña
        console.log('Password reset attempt:', resetPasswordDto);

        return {
            message: 'Contraseña restablecida exitosamente.',
        };
    }

    @Post('verify-email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verificar email con token' })
    @ApiResponse({ status: 200, description: 'Email verificado exitosamente' })
    @ApiResponse({ status: 400, description: 'Token inválido o expirado' })
    async verifyEmail(@Body() body: { token: string }): Promise<{ message: string }> {
        // Aquí validaríamos el token de verificación de email
        console.log('Email verification attempt:', body.token);

        return {
            message: 'Email verificado exitosamente.',
        };
    }

    @Post('resend-verification')
    @HttpCode(HttpStatus.OK)
    @Throttle({ default: { limit: 2, ttl: 600000 } }) // 2 intentos cada 10 minutos
    @ApiOperation({ summary: 'Reenviar email de verificación' })
    @ApiResponse({ status: 200, description: 'Email de verificación enviado' })
    async resendVerification(@Body() body: { email: string }): Promise<{ message: string }> {
        // Aquí reenviaríamos el email de verificación
        console.log('Resend verification for:', body.email);

        return {
            message: 'Si el email existe y no está verificado, recibirás un nuevo email de verificación.',
        };
    }

    // Google OAuth endpoints
    @Get('google')
    @ApiOperation({ summary: 'Iniciar login con Google' })
    async googleLogin(@Res() res: Response) {
        // Aquí redirigiríamos a Google OAuth
        return res.redirect('/api/v1/auth/google/callback');
    }

    @Get('google/callback')
    @ApiOperation({ summary: 'Callback de Google OAuth' })
    async googleCallback(@Res() res: Response) {
        // Aquí manejaríamos el callback de Google y crearíamos/actualizaríamos el usuario
        return res.redirect('/api/v1/auth/google/success');
    }

    @Get('google/success')
    @ApiOperation({ summary: 'Página de éxito de Google OAuth' })
    async googleSuccess(@Res() res: Response) {
        return res.send(`
      <html>
        <body>
          <h2>Login con Google exitoso</h2>
          <p>Puedes cerrar esta ventana y volver a la aplicación.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
    }

    // LinkedIn OAuth endpoints
    @Get('linkedin')
    @ApiOperation({ summary: 'Iniciar login con LinkedIn' })
    async linkedinLogin(@Res() res: Response) {
        // Aquí redirigiríamos a LinkedIn OAuth
        return res.redirect('/api/v1/auth/linkedin/callback');
    }

    @Get('linkedin/callback')
    @ApiOperation({ summary: 'Callback de LinkedIn OAuth' })
    async linkedinCallback(@Res() res: Response) {
        // Aquí manejaríamos el callback de LinkedIn
        return res.redirect('/api/v1/auth/linkedin/success');
    }

    @Get('linkedin/success')
    @ApiOperation({ summary: 'Página de éxito de LinkedIn OAuth' })
    async linkedinSuccess(@Res() res: Response) {
        return res.send(`
      <html>
        <body>
          <h2>Login con LinkedIn exitoso</h2>
          <p>Puedes cerrar esta ventana y volver a la aplicación.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
    }

    @Get('health')
    @ApiOperation({ summary: 'Health check del servicio de autenticación' })
    @ApiResponse({ status: 200, description: 'Servicio funcionando correctamente' })
    async health(): Promise<{ status: string; timestamp: string }> {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
        };
    }
}