import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { QuotesModule } from '../quotes/quotes.module';

@Module({
    imports: [UsersModule, CompaniesModule, QuotesModule],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})

@Module({
    imports: [UsersModule, CompaniesModule, QuotesModule],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule { }