import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

type CalculatedItem = {
    description: string;
    quantity: number;
    unitPrice: number;
    unit: string;
    discount: number;
    taxRate: number;
    order: number;
    totalPrice: number;
    serviceId?: string | null;
};

type CalculatedTotals = {
    items: CalculatedItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
};

@Injectable()
export class QuotesService {
    constructor(private prisma: PrismaService) { }

    private calculateTotals(inputItems: CreateQuoteDto['items'], defaultTaxRate = 0.18): CalculatedTotals {
        if (!inputItems || inputItems.length === 0) {
            throw new BadRequestException('La cotización debe tener al menos un item');
        }

        let subtotal = 0;
        let discountAmount = 0;
        let taxAmount = 0;
        let totalAmount = 0;

        const items: CalculatedItem[] = inputItems.map((item, index) => {
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unitPrice);

            const discount = Number(item.discount ?? 0);
            const taxRate = Number(item.taxRate ?? defaultTaxRate);
            const order = Number(item.order ?? index);

            const lineSubtotal = quantity * unitPrice;
            const netBeforeTax = Math.max(lineSubtotal - discount, 0);
            const lineTax = netBeforeTax * taxRate;
            const totalPrice = netBeforeTax + lineTax;

            subtotal += netBeforeTax;
            discountAmount += discount;
            taxAmount += lineTax;
            totalAmount += totalPrice;

            return {
                description: item.description,
                quantity,
                unitPrice,
                unit: item.unit ?? 'unit',
                discount,
                taxRate,
                order,
                totalPrice,
                serviceId: item.serviceId ?? null,
            };
        });

        return { items, subtotal, discountAmount, taxAmount, totalAmount };
    }

    private validateStatusTransition(from: QuoteStatus, to: QuoteStatus) {
        if (from === to) return;

        const allowed: Record<QuoteStatus, QuoteStatus[]> = {
            DRAFT: ['SENT', 'CANCELLED'],
            SENT: ['VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
            VIEWED: ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'],
            ACCEPTED: [],
            REJECTED: [],
            EXPIRED: [],
            CANCELLED: [],
        };

        const next = allowed[from] ?? [];
        if (!next.includes(to)) {
            throw new BadRequestException(`Transición de estado inválida: ${from} -> ${to}`);
        }
    }

    private buildStatusTimestampPatch(status: QuoteStatus): Partial<{
        sentAt: Date;
        viewedAt: Date;
        acceptedAt: Date;
        rejectedAt: Date;
        expiredAt: Date;
    }> {
        const now = new Date();
        switch (status) {
            case 'SENT':
                return { sentAt: now };
            case 'VIEWED':
                return { viewedAt: now };
            case 'ACCEPTED':
                return { acceptedAt: now };
            case 'REJECTED':
                return { rejectedAt: now };
            case 'EXPIRED':
                return { expiredAt: now };
            default:
                return {};
        }
    }

    async create(createQuoteDto: CreateQuoteDto) {
        const { items: inputItems, taxRate, discountAmount: _ignoredDiscount, subtotal: _ignoredSubtotal, status: _ignoredStatus, ...rest } =
            createQuoteDto;

        const totals = this.calculateTotals(inputItems, taxRate ?? 0.18);

        return this.prisma.quote.create({
            data: {
                ...rest,
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                discountAmount: totals.discountAmount,
                totalAmount: totals.totalAmount,
                status: 'DRAFT',
                quoteNumber: await this.generateQuoteNumber(),
                items: {
                    create: totals.items.map((i) => ({
                        description: i.description,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                        unit: i.unit,
                        discount: i.discount,
                        taxRate: i.taxRate,
                        order: i.order,
                        totalPrice: i.totalPrice,
                        serviceId: i.serviceId ?? undefined,
                    })),
                },
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
        return this.prisma.quote.findFirst({
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
        const existing = await this.findOne(id);
        if (!existing) {
            throw new NotFoundException('Quote not found');
        }

        const { items: inputItems, taxRate, status, subtotal: _ignoredSubtotal, discountAmount: _ignoredDiscount, ...rest } = updateQuoteDto;

        const shouldReplaceItems = Array.isArray(inputItems);

        const shouldChangeStatus = typeof status !== 'undefined' && status !== null;
        if (shouldChangeStatus) {
            this.validateStatusTransition(existing.status as QuoteStatus, status as QuoteStatus);
        }

        const totals = shouldReplaceItems ? this.calculateTotals(inputItems, taxRate ?? 0.18) : null;

        const updated = await this.prisma.$transaction(async (tx) => {
            if (shouldReplaceItems) {
                await tx.quoteItem.deleteMany({ where: { quoteId: id } });
            }

            const data: any = {
                ...rest,
                ...(shouldChangeStatus && {
                    status,
                    ...this.buildStatusTimestampPatch(status as QuoteStatus),
                }),
                ...(totals && {
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    discountAmount: totals.discountAmount,
                    totalAmount: totals.totalAmount,
                    items: {
                        create: totals.items.map((i) => ({
                            description: i.description,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            unit: i.unit,
                            discount: i.discount,
                            taxRate: i.taxRate,
                            order: i.order,
                            totalPrice: i.totalPrice,
                            serviceId: i.serviceId ?? undefined,
                        })),
                    },
                }),
            };

            const quote = await tx.quote.update({
                where: { id },
                data,
                include: {
                    items: true,
                    client: true,
                    assignedTo: true,
                    createdBy: true,
                    versions: true,
                },
            });

            if (shouldReplaceItems || shouldChangeStatus) {
                await tx.quoteVersion.create({
                    data: {
                        quoteId: id,
                        versionNumber: (await tx.quoteVersion.count({ where: { quoteId: id } })) + 1,
                        title: quote.title,
                        description: quote.description,
                        subtotal: quote.subtotal,
                        taxAmount: quote.taxAmount,
                        totalAmount: quote.totalAmount,
                        items: quote.items.map((it) => ({
                            id: it.id,
                            description: it.description,
                            quantity: it.quantity,
                            unitPrice: it.unitPrice,
                            unit: it.unit,
                            discount: it.discount,
                            taxRate: it.taxRate,
                            order: it.order,
                            totalPrice: it.totalPrice,
                            serviceId: it.serviceId,
                        })) as any,
                        createdById: quote.createdById,
                    },
                });
            }

            return quote;
        });

        return updated;
    }

    async remove(id: string) {
        const existing = await this.findOne(id);
        if (!existing) {
            throw new NotFoundException('Quote not found');
        }

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
        if (!quote) {
            throw new NotFoundException('Quote not found');
        }

        return this.prisma.quoteVersion.create({
            data: {
                quoteId,
                versionNumber:
                    (await this.prisma.quoteVersion.count({
                        where: { quoteId },
                    })) + 1,
                title: quote.title,
                description: quote.description,
                subtotal: quote.subtotal,
                taxAmount: quote.taxAmount,
                totalAmount: quote.totalAmount,
                items: quote.items.map((it) => ({
                    id: it.id,
                    description: it.description,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    unit: it.unit,
                    discount: it.discount,
                    taxRate: it.taxRate,
                    order: it.order,
                    totalPrice: it.totalPrice,
                    serviceId: it.serviceId,
                })) as any,
                createdById,
            },
        });
    }

    async sendQuote(quoteId: string) {
        return this.update(quoteId, { status: 'SENT' } as any);
    }

    async generatePdf(quoteId: string): Promise<Buffer> {
        const quote = await this.findOne(quoteId);
        if (!quote) {
            throw new NotFoundException('Quote not found');
        }

        // This would be implemented with a PDF generation library
        // For now, return a placeholder
        return Buffer.from(`PDF content for quote ${quote.quoteNumber}`);
    }

    async updateStatus(quoteId: string, status: QuoteStatus) {
        return this.update(quoteId, { status } as any);
    }
}