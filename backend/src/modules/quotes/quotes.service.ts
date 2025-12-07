import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { CompaniesService } from '../companies/companies.service';
import { ContactsService } from '../contacts/contacts.service';

@Injectable()
export class QuotesService {
    constructor(
        private prisma: PrismaService,
        private companiesService: CompaniesService,
        private contactsService: ContactsService,
    ) { }

    async create(createQuoteDto: CreateQuoteDto) {
        // Calculate total amount
        const subtotal = createQuoteDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const taxAmount = subtotal * (createQuoteDto.taxRate || 0.18);
        const totalAmount = subtotal + taxAmount - (createQuoteDto.discountAmount || 0);

        return this.prisma.quote.create({
            data: {
                ...createQuoteDto,
                subtotal,
                taxAmount,
                totalAmount,
                status: 'DRAFT',
                quoteNumber: await this.generateQuoteNumber(),
            },
            include: {
                items: true,
                client: true,
                assignedTo: true,
                createdBy: true,
            },
        });
    }

    async findAll() {
        return this.prisma.quote.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                items: true,
                client: true,
                assignedTo: true,
                createdBy: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.quote.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                items: true,
                client: true,
                assignedTo: true,
                createdBy: true,
                versions: true,
            },
        });
    }

    async update(id: string, updateQuoteDto: UpdateQuoteDto) {
        // Recalculate totals if items are updated
        let subtotal = 0;
        let taxAmount = 0;
        let totalAmount = 0;

        if (updateQuoteDto.items) {
            subtotal = updateQuoteDto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
            taxAmount = subtotal * (updateQuoteDto.taxRate || 0.18);
            totalAmount = subtotal + taxAmount - (updateQuoteDto.discountAmount || 0);
        }

        return this.prisma.quote.update({
            where: {
                id,
            },
            data: {
                ...updateQuoteDto,
                ...(updateQuoteDto.items && {
                    subtotal,
                    taxAmount,
                    totalAmount,
                }),
            },
            include: {
                items: true,
                client: true,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.quote.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findByCompany(companyId: string) {
        return this.prisma.quote.findMany({
            where: {
                clientId: companyId,
                deletedAt: null,
            },
            include: {
                items: true,
                assignedTo: true,
                createdBy: true,
            },
        });
    }

    async findByStatus(status: string) {
        return this.prisma.quote.findMany({
            where: {
                status: status as any,
                deletedAt: null,
            },
            include: {
                client: true,
                assignedTo: true,
            },
        });
    }

    async search(query: string) {
        return this.prisma.quote.findMany({
            where: {
                OR: [
                    {
                        quoteNumber: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        title: {
                            contains: query,
                            mode: 'insensitive',
                        },
                    },
                    {
                        client: {
                            name: {
                                contains: query,
                                mode: 'insensitive',
                            },
                        },
                    },
                ],
                deletedAt: null,
            },
            include: {
                client: true,
                assignedTo: true,
            },
        });
    }

    async generateQuoteNumber(): Promise<string> {
        const count = await this.prisma.quote.count();
        const year = new Date().getFullYear().toString().substring(2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        return `QTE-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }

    async createVersion(quoteId: string, createdById: string) {
        const quote = await this.findOne(quoteId);

        return this.prisma.quoteVersion.create({
            data: {
                quoteId,
                versionNumber: (await this.prisma.quoteVersion.count({
                    where: { quoteId }
                })) + 1,
                title: quote.title,
                description: quote.description,
                subtotal: quote.subtotal,
                taxAmount: quote.taxAmount,
                totalAmount: quote.totalAmount,
                items: quote.items as any,
                createdById,
            },
        });
    }

    async sendQuote(quoteId: string) {
        return this.prisma.quote.update({
            where: { id: quoteId },
            data: {
                status: 'SENT',
                sentAt: new Date(),
            },
        });
    }

    async generatePdf(quoteId: string): Promise<Buffer> {
        const quote = await this.findOne(quoteId);
        if (!quote) {
            throw new Error('Quote not found');
        }

        // This would be implemented with a PDF generation library
        // For now, return a placeholder
        return Buffer.from(`PDF content for quote ${quote.quoteNumber}`);
    }
}