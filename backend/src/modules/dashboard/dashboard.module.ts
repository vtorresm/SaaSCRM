import { Module } from '@nestjs/common';
import { DashboardController } from "@/modules/dashboard/dashboard.controller";
import { DashboardService } from '@/modules/dashboard/dashboard.service';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { ContactsModule } from "@/modules/contacts/contacts.module";

@Module({
    imports: [CompaniesModule, ContactsModule],
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }