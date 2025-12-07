import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CompaniesModule } from '../companies/companies.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
    imports: [CompaniesModule, ContactsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }