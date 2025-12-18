import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../../config/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateInvoiceFromQuoteDto } from './dto/create-invoice-from-quote.dto';

type CalculatedItem = {
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    taxRate: number;
    order: number;
    totalPrice: number;
};

type CalculatedTotals = {
    items: CalculatedItem[];
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
    dueAmount: number;
};

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    private calculateTotals(inputItems: CreateInvoiceDto['items'], defaultTaxRate = 0.18): CalculatedTotals {
        if (!inputItems || inputItems.length === 0) {
            throw new BadRequestException('La factura debe tener al menos un item');
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
                discount,
                taxRate,
                order,
                totalPrice,
            };
        });

        return { 
            items, 
            subtotal, 
            discountAmount, 
            taxAmount, 
            totalAmount,
            dueAmount: totalAmount // Initially, full amount is due
        };
    }

    private validateStatusTransition(from: InvoiceStatus, to: InvoiceStatus) {
        if (from === to) return;

        const allowed: Record<InvoiceStatus, InvoiceStatus[]> = {
            DRAFT: ['SENT', 'CANCELLED'],
            SENT: ['PAID', 'OVERDUE', 'CANCELLED'],
            PAID: ['REFUNDED'], // Only from PAID can we refund
            OVERDUE: ['PAID', 'CANCELLED'],
            CANCELLED: [],
            REFUNDED: [],
        };

        const next = allowed[from] ?? [];
        if (!next.includes(to)) {
            throw new BadRequestException(`Transición de estado inválida: ${from} -> ${to}`);
        }
    }

    private buildStatusTimestampPatch(status: InvoiceStatus): Partial<{
        paidDate: Date;
    }> {
        const now = new Date();
        switch (status) {
            case 'PAID':
                return { paidDate: now };
            default:
                return {};
        }
    }

    async create(createInvoiceDto: CreateInvoiceDto) {
        const { items: inputItems, taxRate, discountAmount: _ignoredDiscount, subtotal: _ignoredSubtotal, status: _ignoredStatus, ...rest } =
            createInvoiceDto;

        const totals = this.calculateTotals(inputItems, taxRate ?? 0.18);
        const dueDate = new Date(rest.dueDate);

        return this.prisma.invoice.create({
            data: {
                ...rest,
                dueDate,
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                discountAmount: totals.discountAmount,
                totalAmount: totals.totalAmount,
                dueAmount: totals.dueAmount,
                status: 'DRAFT',
                invoiceNumber: await this.generateInvoiceNumber(),
                items: {
                    create: totals.items.map((i) => ({
                        description: i.description,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                        discount: i.discount,
                        taxRate: i.taxRate,
                        order: i.order,
                        totalPrice: i.totalPrice,
                    })),
                },
            },
            include: {
                items: true,
                client: true,
                quote: true,
                project: true,
                createdBy: true,
                payments: true,
            },
        });
    }

    async findAll() {
        return this.prisma.invoice.findMany({
            where: {
                deletedAt: null,
            },
            include: {
                items: true,
                client: true,
                quote: true,
                project: true,
                createdBy: true,
                payments: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        return this.prisma.invoice.findFirst({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                items: true,
                client: true,
                quote: true,
                project: true,
                createdBy: true,
                payments: true,
            },
        });
    }

    async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
        const existing = await this.findOne(id);
        if (!existing) {
            throw new NotFoundException('Invoice not found');
        }

        const { items: inputItems, taxRate, status, subtotal: _ignoredSubtotal, discountAmount: _ignoredDiscount, dueDate, ...rest } = updateInvoiceDto;

        const shouldReplaceItems = Array.isArray(inputItems);
        const shouldChangeStatus = typeof status !== 'undefined' && status !== null;

        if (shouldChangeStatus) {
            this.validateStatusTransition(existing.status as InvoiceStatus, status as InvoiceStatus);
        }

        const totals = shouldReplaceItems ? this.calculateTotals(inputItems, taxRate ?? 0.18) : null;

        const updated = await this.prisma.$transaction(async (tx) => {
            if (shouldReplaceItems) {
                await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
            }

            const data: any = {
                ...rest,
                ...(dueDate && { dueDate: new Date(dueDate) }),
                ...(shouldChangeStatus && {
                    status,
                    ...this.buildStatusTimestampPatch(status as InvoiceStatus),
                }),
                ...(totals && {
                    subtotal: totals.subtotal,
                    taxAmount: totals.taxAmount,
                    discountAmount: totals.discountAmount,
                    totalAmount: totals.totalAmount,
                    dueAmount: totals.totalAmount - existing.paidAmount, // Recalculate due amount
                    items: {
                        create: totals.items.map((i) => ({
                            description: i.description,
                            quantity: i.quantity,
                            unitPrice: i.unitPrice,
                            discount: i.discount,
                            taxRate: i.taxRate,
                            order: i.order,
                            totalPrice: i.totalPrice,
                        })),
                    },
                }),
            };

            const invoice = await tx.invoice.update({
                where: { id },
                data,
                include: {
                    items: true,
                    client: true,
                    quote: true,
                    project: true,
                    createdBy: true,
                    payments: true,
                },
            });

            return invoice;
        });

        return updated;
    }

    async remove(id: string) {
        const existing = await this.findOne(id);
        if (!existing) {
            throw new NotFoundException('Invoice not found');
        }

        return this.prisma.invoice.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

    async findByClient(clientId: string) {
        return this.prisma.invoice.findMany({
            where: {
                clientId,
                deletedAt: null,
            },
            include: {
                items: true,
                quote: true,
                project: true,
                createdBy: true,
                payments: true,
            },
        });
    }

    async findByStatus(status: string) {
        return this.prisma.invoice.findMany({
            where: {
                status: status as any,
                deletedAt: null,
            },
            include: {
                client: true,
                quote: true,
                project: true,
            },
        });
    }

    async findOverdue() {
        return this.prisma.invoice.findMany({
            where: {
                status: { in: ['SENT', 'OVERDUE'] },
                dueDate: { lt: new Date() },
                deletedAt: null,
            },
            include: {
                client: true,
                items: true,
                payments: true,
            },
        });
    }

    async search(query: string) {
        return this.prisma.invoice.findMany({
            where: {
                OR: [
                    {
                        invoiceNumber: {
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
                quote: true,
                project: true,
            },
        });
    }

    async generateInvoiceNumber(): Promise<string> {
        const count = await this.prisma.invoice.count();
        const year = new Date().getFullYear().toString().substring(2);
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        return `INV-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
    }

    async updateStatus(id: string, status: InvoiceStatus) {
        const existing = await this.findOne(id);
        if (!existing) {
            throw new NotFoundException('Invoice not found');
        }

        this.validateStatusTransition(existing.status as InvoiceStatus, status);

        const data: any = {
            status,
            ...this.buildStatusTimestampPatch(status),
        };

        // Recalculate due amount when status changes to PAID
        if (status === 'PAID') {
            const totalPaid = existing.payments.reduce((sum, payment) => sum + payment.amount, 0);
            data.dueAmount = Math.max(0, existing.totalAmount - totalPaid);
        }

        return this.prisma.invoice.update({
            where: { id },
            data,
            include: {
                items: true,
                client: true,
                quote: true,
                project: true,
                createdBy: true,
                payments: true,
            },
        });
    }

    // Payment Management
    async addPayment(invoiceId: string, createPaymentDto: CreatePaymentDto) {
        const invoice = await this.findOne(invoiceId);
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        const paymentDate = createPaymentDto.date ? new Date(createPaymentDto.date) : new Date();

        const payment = await this.prisma.$transaction(async (tx) => {
            // Create payment record
            const newPayment = await tx.payment.create({
                data: {
                    amount: createPaymentDto.amount,
                    paymentMethod: createPaymentDto.paymentMethod,
                    transactionId: createPaymentDto.transactionId,
                    notes: createPaymentDto.notes,
                    date: paymentDate,
                    invoiceId,
                },
            });

            // Update invoice totals
            const totalPaid = invoice.paidAmount + createPaymentDto.amount;
            const newDueAmount = Math.max(0, invoice.totalAmount - totalPaid);
            const newStatus = newDueAmount === 0 ? 'PAID' : invoice.status;

            await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    paidAmount: totalPaid,
                    dueAmount: newDueAmount,
                    status: newStatus,
                    ...(newStatus === 'PAID' && { paidDate: new Date() }),
                },
            });

            return newPayment;
        });

        return payment;
    }

    async getPayments(invoiceId: string) {
        const invoice = await this.findOne(invoiceId);
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        return this.prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { date: 'desc' },
        });
    }

    // Generate Invoice from Quote (Sprint 6 Feature)
    async createFromQuote(createInvoiceFromQuoteDto: CreateInvoiceFromQuoteDto) {
        const { quoteId, createdById, dueDate, projectId } = createInvoiceFromQuoteDto;

        // Get the approved quote
        const quote = await this.prisma.quote.findFirst({
            where: {
                id: quoteId,
                status: 'ACCEPTED',
                deletedAt: null,
            },
            include: {
                items: { orderBy: { order: 'asc' } },
                client: true,
            },
        });

        if (!quote) {
            throw new BadRequestException('Quote not found or not approved');
        }

        // Check if invoice already exists for this quote
        const existingInvoice = await this.prisma.invoice.findFirst({
            where: { quoteId },
        });

        if (existingInvoice) {
            throw new BadRequestException('Invoice already exists for this quote');
        }

        // Create invoice items from quote items
        const invoiceItems = quote.items.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            taxRate: item.taxRate,
            order: index,
            totalPrice: item.totalPrice,
        }));

        // Calculate totals using existing logic
        const totals = this.calculateTotals(invoiceItems);

        // Determine due date (default: 30 days from now)
        const invoiceDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        // Create the invoice
        const invoice = await this.prisma.invoice.create({
            data: {
                clientId: quote.clientId,
                quoteId: quote.id,
                projectId,
                createdById,
                dueDate: invoiceDueDate,
                // Note: notes field not available in Prisma schema, can be added later
                subtotal: totals.subtotal,
                taxAmount: totals.taxAmount,
                discountAmount: totals.discountAmount,
                totalAmount: totals.totalAmount,
                dueAmount: totals.dueAmount,
                status: 'DRAFT',
                invoiceNumber: await this.generateInvoiceNumber(),
                items: {
                    create: invoiceItems,
                },
            },
            include: {
                items: true,
                client: true,
                quote: true,
                project: true,
                createdBy: true,
                payments: true,
            },
        });

        return invoice;
    }

    async getInvoiceStats() {
        const [totalInvoices, paidInvoices, overdueInvoices, draftInvoices] = await Promise.all([
            this.prisma.invoice.count({ where: { deletedAt: null } }),
            this.prisma.invoice.count({ where: { status: 'PAID', deletedAt: null } }),
            this.prisma.invoice.findMany({
                where: {
                    status: { in: ['SENT', 'OVERDUE'] },
                    dueDate: { lt: new Date() },
                    deletedAt: null,
                },
            }),
            this.prisma.invoice.count({ where: { status: 'DRAFT', deletedAt: null } }),
        ]);

        const totalRevenue = await this.prisma.invoice.aggregate({
            where: { status: 'PAID', deletedAt: null },
            _sum: { totalAmount: true },
        });

        const outstandingAmount = await this.prisma.invoice.aggregate({
            where: { 
                status: { in: ['SENT', 'OVERDUE'] },
                deletedAt: null 
            },
            _sum: { dueAmount: true },
        });

        return {
            totalInvoices,
            paidInvoices,
            overdueInvoices: overdueInvoices.length,
            draftInvoices,
            totalRevenue: totalRevenue._sum.totalAmount || 0,
            outstandingAmount: outstandingAmount._sum.dueAmount || 0,
        };
    }

    async generatePdf(invoiceId: string): Promise<Buffer> {
        const invoice = await this.findOne(invoiceId);
        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }

        // This would be implemented with a PDF generation library like PDFKit or Puppeteer
        // For now, return a placeholder
        return Buffer.from(`PDF content for invoice ${invoice.invoiceNumber}`);
    }
}