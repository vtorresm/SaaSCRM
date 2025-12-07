import { Injectable } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { ContactsService } from '../contacts/contacts.service';
import { QuotesService } from '../quotes/quotes.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly companiesService: CompaniesService,
        private readonly contactsService: ContactsService,
        private readonly quotesService: QuotesService,
    ) { }

    async getMetrics() {
        const companies = await this.companiesService.findAll();
        const contacts = await this.contactsService.findAll();
        const quotes = await this.quotesService.findAll();

        return {
            totalCompanies: companies.length,
            totalContacts: contacts.length,
            totalQuotes: quotes.length,
            companiesByStatus: await this.getCompaniesByStatus(),
            contactsByStatus: await this.getContactsByStatus(),
            quotesByStatus: await this.getQuotesByStatus(),
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

    async getQuotesByStatus() {
        const statuses = ['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'];
        const result = {};

        for (const status of statuses) {
            const quotes = await this.quotesService.findByStatus(status);
            result[status] = quotes.length;
        }

        return result;
    }

    async getRecentActivities() {
        // This would be enhanced with audit logs in future sprints
        const recentCompanies = await this.companiesService.findAll();
        const recentContacts = await this.contactsService.findAll();
        const recentQuotes = await this.quotesService.findAll();

        return {
            recentCompanies: recentCompanies.slice(0, 5),
            recentContacts: recentContacts.slice(0, 5),
            recentQuotes: recentQuotes.slice(0, 5),
        };
    }
}