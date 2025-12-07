import { Injectable } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { ContactsService } from '../contacts/contacts.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly companiesService: CompaniesService,
        private readonly contactsService: ContactsService,
    ) { }

    async getMetrics() {
        const companies = await this.companiesService.findAll();
        const contacts = await this.contactsService.findAll();

        return {
            totalCompanies: companies.length,
            totalContacts: contacts.length,
            companiesByStatus: await this.getCompaniesByStatus(),
            contactsByStatus: await this.getContactsByStatus(),
        };
    }

    async getCompaniesByStatus() {
        const statuses = ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CLIENT', 'ARCHIVED'];
        const result = {};

        for (const status of statuses) {
            const companies = await this.companiesService.findByStatus(status);
            result[status] = companies.length;
        }

        return result;
    }

    async getContactsByStatus() {
        const statuses = ['ACTIVE', 'INACTIVE', 'PROSPECT', 'CLIENT'];
        const result = {};

        for (const status of statuses) {
            const contacts = await this.contactsService.findByStatus(status);
            result[status] = contacts.length;
        }

        return result;
    }

    async getRecentActivities() {
        // This would be enhanced with audit logs in future sprints
        const recentCompanies = await this.companiesService.findAll();
        const recentContacts = await this.contactsService.findAll();

        return {
            recentCompanies: recentCompanies.slice(0, 5),
            recentContacts: recentContacts.slice(0, 5),
        };
    }
}