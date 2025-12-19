import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { QuotesService } from '../quotes/quotes.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class ReportsService {
    constructor(
        private usersService: UsersService,
        private companiesService: CompaniesService,
        private quotesService: QuotesService,
        private invoicesService: InvoicesService,
    ) { }

    async generateUserReport() {
        const userStats = await this.usersService.getUserStats();
        const users = await this.usersService.findAll();

        return {
            title: 'User Activity Report',
            generatedAt: new Date(),
            summary: {
                totalUsers: userStats.totalUsers,
                activeUsers: userStats.activeUsers,
                inactiveUsers: userStats.inactiveUsers,
                usersByRole: userStats.usersByRole,
            },
            users: users.map(user => ({
                id: user.id,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: user.role,
                status: user.status,
                company: user.company?.name || 'N/A',
                createdAt: user.createdAt,
            })),
        };
    }

    async generateCompanyReport() {
        const companies = await this.companiesService.findAll();

        return {
            title: 'Company Activity Report',
            generatedAt: new Date(),
            summary: {
                totalCompanies: companies.length,
                companiesByStatus: await this.companiesService.findByStatus('ACTIVE'),
            },
            companies: companies.map(company => ({
                id: company.id,
                name: company.name,
                status: company.status,
                contactCount: company.contacts?.length || 0,
                quoteCount: company.quotes?.length || 0,
                createdAt: company.createdAt,
            })),
        };
    }

    async generateSalesReport() {
        const quotes = await this.quotesService.findAll();

        return {
            title: 'Sales Performance Report',
            generatedAt: new Date(),
            summary: {
                totalQuotes: quotes.length,
                totalValue: quotes.reduce((sum, quote) => sum + quote.totalAmount, 0),
                averageQuoteValue: quotes.length > 0
                    ? quotes.reduce((sum, quote) => sum + quote.totalAmount, 0) / quotes.length
                    : 0,
            },
            quotesByStatus: await this.quotesService.findByStatus('SENT'),
            recentQuotes: quotes.slice(0, 10).map(quote => ({
                id: quote.id,
                quoteNumber: quote.quoteNumber,
                title: quote.title,
                status: quote.status,
                totalAmount: quote.totalAmount,
                client: quote.client.name,
                createdAt: quote.createdAt,
            })),
        };
    }

    async generateSystemReport() {
        const [userStats, companies, quotes] = await Promise.all([
            this.usersService.getUserStats(),
            this.companiesService.findAll(),
            this.quotesService.findAll(),
        ]);

        return {
            title: 'System Overview Report',
            generatedAt: new Date(),
            summary: {
                totalUsers: userStats.totalUsers,
                totalCompanies: companies.length,
                totalQuotes: quotes.length,
                activeUsers: userStats.activeUsers,
            },
            activity: {
                recentUsers: (await this.usersService.findAll()).slice(0, 5),
                recentCompanies: companies.slice(0, 5),
                recentQuotes: quotes.slice(0, 5),
            },
        };
    }

    async generateCustomReport(startDate: string, endDate: string, reportType: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (reportType === 'users') {
            const users = await this.usersService.findAll();
            const filteredUsers = users.filter(user =>
                user.createdAt >= start && user.createdAt <= end
            );

            return {
                title: `Custom User Report (${startDate} to ${endDate})`,
                generatedAt: new Date(),
                count: filteredUsers.length,
                users: filteredUsers.map(user => ({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                })),
            };
        }

        if (reportType === 'quotes') {
            const quotes = await this.quotesService.findAll();
            const filteredQuotes = quotes.filter(quote =>
                quote.createdAt >= start && quote.createdAt <= end
            );

            return {
                title: `Custom Sales Report (${startDate} to ${endDate})`,
                generatedAt: new Date(),
                count: filteredQuotes.length,
                totalValue: filteredQuotes.reduce((sum, quote) => sum + quote.totalAmount, 0),
                quotes: filteredQuotes.map(quote => ({
                    id: quote.id,
                    quoteNumber: quote.quoteNumber,
                    title: quote.title,
                    status: quote.status,
                    totalAmount: quote.totalAmount,
                    createdAt: quote.createdAt,
                })),
            };
        }

        return {
            title: `Custom Report (${startDate} to ${endDate})`,
            generatedAt: new Date(),
            message: 'Report type not supported',
        };
    }
}