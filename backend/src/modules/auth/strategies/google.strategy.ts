import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
            scope: ['email', 'profile'],
            passReqToCallback: false,
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
    ): Promise<any> {
        const { id, name, emails, photos } = profile;

        // Validar que tenemos la información mínima necesaria
        if (!emails || !emails[0]) {
            throw new UnauthorizedException('Email no proporcionado por Google');
        }

        const user = {
            googleId: id,
            email: emails[0].value,
            firstName: name?.givenName || '',
            lastName: name?.familyName || '',
            picture: photos?.[0]?.value || null,
            accessToken,
            refreshToken,
        };

        // Aquí en una implementación real:
        // 1. Buscaríamos si el usuario existe en nuestra base de datos
        // 2. Si existe, lo actualizaríamos con la información de Google
        // 3. Si no existe, lo crearíamos como nuevo usuario
        // 4. Retornaríamos el objeto del usuario para adjuntar al request

        console.log('Google OAuth user data:', user);

        // Por ahora retornamos el objeto directamente
        // En producción, esto sería un usuario completo de nuestra BD
        return {
            ...user,
            id: `google-${id}`, // ID temporal basado en Google ID
            role: 'SALES_REP', // Rol por defecto
            status: 'ACTIVE',
            emailVerified: true, // Google ya verificó el email
        };
    }
}