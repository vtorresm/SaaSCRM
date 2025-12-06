import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
    constructor(private readonly configService: ConfigService) {
        super({
            clientID: configService.get<string>('LINKEDIN_CLIENT_ID'),
            clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET'),
            callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL'),
            scope: ['r_liteprofile', 'r_emailaddress'],
            passReqToCallback: false,
            state: true,
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user?: any, info?: any) => void,
    ): Promise<any> {
        try {
            const { id, name, emails, photos } = profile;

            // LinkedIn puede no proporcionar email para todos los usuarios
            // En ese caso,，我们必须 manejar este escenario
            const email = emails?.[0]?.value;
            if (!email) {
                throw new UnauthorizedException('Email no proporcionado por LinkedIn. Algunos usuarios de LinkedIn pueden no compartir su email.');
            }

            const user = {
                linkedinId: id,
                email: email,
                firstName: name?.givenName || '',
                lastName: name?.familyName || '',
                picture: photos?.[0]?.value || null,
                accessToken,
                refreshToken,
            };

            // Aquí en una implementación real:
            // 1. Buscaríamos si el usuario existe en nuestra base de datos
            // 2. Si existe, lo actualizaríamos con la información de LinkedIn
            // 3. Si no existe, lo crearíamos como nuevo usuario
            // 4. Retornaríamos el objeto del usuario para adjuntar al request

            console.log('LinkedIn OAuth user data:', user);

            // Por ahora retornamos el objeto directamente
            // En producción, esto sería un usuario completo de nuestra BD
            const validatedUser = {
                ...user,
                id: `linkedin-${id}`, // ID temporal basado en LinkedIn ID
                role: 'SALES_REP', // Rol por defecto
                status: 'ACTIVE',
                emailVerified: true, // LinkedIn ya verificó el email
            };

            done(null, validatedUser);
        } catch (error) {
            done(error, null);
        }
    }
}