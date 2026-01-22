import { Module } from '@nestjs/common';
import { CompaniesController } from "@/modules/companies/companies.controller";
import { CompaniesService } from "@/modules/companies/companies.service";

@Module({
    controllers: [CompaniesController],
    providers: [CompaniesService],
    exports: [CompaniesService],
})
export class CompaniesModule { }