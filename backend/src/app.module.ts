import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Database
import { PrismaModule } from './config/prisma.module';

// Auth module
import { AuthModule } from './modules/auth/auth.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
        }),

        // Rate limiting
        ThrottlerModule.forRoot([
            {
                ttl: 60, // 60 seconds
                limit: 100, // 100 requests per TTL
            },
        ]),

        // Database
        PrismaModule,

        // Auth module
        AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }