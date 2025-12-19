import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// Database
import { PrismaModule } from './config/prisma.module';

// Auth module
import { AuthModule } from './modules/auth/auth.module';

// CRM Modules
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { UsersModule } from './modules/users/users.module';
import { TeamsModule } from './modules/teams/teams.module';
import { EmailModule } from './modules/email/email.module';
import { ReportsModule } from './modules/reports/reports.module';

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

        // CRM Modules
        CompaniesModule,
        ContactsModule,
        DashboardModule,
        QuotesModule,
        InvoicesModule,
        UsersModule,
        TeamsModule,
        ReportsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }