import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../config/prisma.service';
import { InvoicesService } from '../invoices.service';

describe('InvoicesService', () => {
    let service: InvoicesService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                InvoicesService,
                {
                    provide: PrismaService,
                    useValue: {
                        invoice: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findFirst: jest.fn(),
                            update: jest.fn(),
                            count: jest.fn(),
                        },
                        invoiceItem: {
                            deleteMany: jest.fn(),
                        },
                        payment: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                        },
                        quote: {
                            findFirst: jest.fn(),
                        },
                        $transaction: jest.fn((fn) => fn(prismaService)),
                        auditLog: {
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<InvoicesService>(InvoicesService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('calculateTotals', () => {
        it('should calculate totals correctly with items and tax', () => {
            const items = [
                { description: 'Item 1', quantity: 2, unitPrice: 100, discount: 0, taxRate: 0.18, order: 0 },
                { description: 'Item 2', quantity: 1, unitPrice: 50, discount: 10, taxRate: 0.18, order: 1 },
            ];

            // @ts-ignore - acceso a método privado para test
            const totals = service.calculateTotals(items);

            // Item1: (2*100) + 18% = 236
            // Item2: (1*50-10=40) + 18% = 47.2
            expect(totals.items[0].totalPrice).toBe(236);
            expect(totals.items[1].totalPrice).toBe(47.2);
            expect(totals.subtotal).toBe(190); // 200 - 10 = 190 (neto antes de impuestos)
            expect(totals.discountAmount).toBe(10);
            expect(totals.taxAmount).toBe(34.2); // 190 * 0.18 = 34.2
            expect(totals.totalAmount).toBe(224.2);
            expect(totals.dueAmount).toBe(224.2);
        });

        it('should throw BadRequestException if items is empty', async () => {
            // @ts-ignore
            expect(() => service.calculateTotals([])).toThrow(BadRequestException);
        });
    });

    describe('create', () => {
        it('should create an invoice with nested write and calculated totals', async () => {
            const createInvoiceDto = {
                dueDate: '2026-02-01T00:00:00.000Z',
                clientId: 'client-id',
                createdById: 'user-id',
                items: [
                    { description: 'Item 1', quantity: 2, unitPrice: 100, taxRate: 0.18 },
                    { description: 'Item 2', quantity: 1, unitPrice: 50, discount: 5, taxRate: 0.18 },
                ],
                taxRate: 0.18,
            };

            jest.spyOn(prismaService.invoice, 'count').mockResolvedValue(0);

            const mockCreated = {
                id: 'invoice-id',
                invoiceNumber: 'INV-2501-0001',
                status: InvoiceStatus.DRAFT,
                subtotal: 0,
                taxAmount: 0,
                discountAmount: 0,
                totalAmount: 0,
                paidAmount: 0,
                dueAmount: 0,
                issueDate: new Date(),
                dueDate: new Date(),
                paidDate: null,
                clientId: 'client-id',
                quoteId: null,
                projectId: null,
                createdById: 'user-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                items: jest.fn(),
                client: jest.fn(),
                createdBy: jest.fn(),
                payments: jest.fn(),
            };

            jest.spyOn(prismaService.invoice, 'create').mockResolvedValue(mockCreated);

            const result = await service.create(createInvoiceDto);

            expect(result).toBeDefined();
            expect(prismaService.invoice.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    clientId: 'client-id',
                    createdById: 'user-id',
                    status: InvoiceStatus.DRAFT,
                    invoiceNumber: 'INV-2501-0001',
                    items: {
                        create: expect.arrayContaining([
                            expect.objectContaining({ description: 'Item 1', quantity: 2, unitPrice: 100 }),
                            expect.objectContaining({ description: 'Item 2', quantity: 1, unitPrice: 50, discount: 5 }),
                        ]),
                    },
                }),
                include: expect.any(Object),
            });
        });
    });

    describe('updateStatus', () => {
        it('should update invoice status with valid transition', async () => {
            const existing = {
                id: 'invoice-id',
                status: InvoiceStatus.DRAFT,
                paidAmount: 0,
                payments: jest.fn(),
            };

            jest.spyOn(prismaService.invoice, 'findFirst').mockResolvedValue(existing as any);
            jest.spyOn(prismaService.invoice, 'update').mockResolvedValue({
                ...existing,
                status: InvoiceStatus.SENT,
                items: jest.fn(),
                client: jest.fn(),
                createdBy: jest.fn(),
                payments: jest.fn(),
            } as any);

            const result = await service.updateStatus('invoice-id', InvoiceStatus.SENT);

            expect(result.status).toBe(InvoiceStatus.SENT);
        });

        it('should throw BadRequestException on invalid transition', async () => {
            const existing = {
                id: 'invoice-id',
                status: InvoiceStatus.PAID,
                payments: jest.fn(),
            };

            jest.spyOn(prismaService.invoice, 'findFirst').mockResolvedValue({
                ...existing,
                items: jest.fn(),
                client: jest.fn(),
                createdBy: jest.fn(),
                payments: jest.fn(),
            } as any);

            await expect(service.updateStatus('invoice-id', InvoiceStatus.DRAFT)).rejects.toThrow(BadRequestException);
        });
    });

    describe('addPayment', () => {
        it('should add payment and update invoice totals', async () => {
            const invoice = {
                id: 'invoice-id',
                totalAmount: 1000,
                paidAmount: 0,
                status: InvoiceStatus.SENT,
                payments: jest.fn(),
            };

            const createPaymentDto = {
                amount: 500,
                paymentMethod: 'credit_card',
                transactionId: 'ch_123456',
                notes: 'Partial payment',
            };

            jest.spyOn(prismaService.invoice, 'findFirst').mockResolvedValue({
                ...invoice,
                items: jest.fn(),
                client: jest.fn(),
                createdBy: jest.fn(),
                payments: jest.fn(),
            } as any);
            jest.spyOn(prismaService.payment, 'create').mockResolvedValue({
                id: 'payment-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                date: new Date(),
                invoiceId: 'invoice-id',
                amount: createPaymentDto.amount,
                paymentMethod: createPaymentDto.paymentMethod,
                transactionId: createPaymentDto.transactionId,
                notes: createPaymentDto.notes,
            });

            const result = await service.addPayment('invoice-id', createPaymentDto);

            expect(result).toBeDefined();
            expect(prismaService.payment.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    amount: 500,
                    paymentMethod: 'credit_card',
                    invoiceId: 'invoice-id',
                }),
            });
        });
    });

    describe('createFromQuote', () => {
        it('should create invoice from approved quote', async () => {
            const quote = {
                id: 'quote-id',
                quoteNumber: 'QTE-2501-0001',
                status: 'ACCEPTED',
                clientId: 'client-id',
                items: [
                    { description: 'Service 1', quantity: 1, unitPrice: 500, discount: 0, taxRate: 0.18, order: 0, totalPrice: 590 },
                ],
                client: jest.fn(),
            };

            const createInvoiceFromQuoteDto = {
                quoteId: 'quote-id',
                createdById: 'user-id',
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue({
                ...quote,
                items: jest.fn(),
            } as any);
            jest.spyOn(prismaService.invoice, 'findFirst').mockResolvedValue(null); // No existing invoice
            jest.spyOn(prismaService.invoice, 'count').mockResolvedValue(0);
            jest.spyOn(prismaService.invoice, 'create').mockResolvedValue({
                id: 'invoice-id',
                invoiceNumber: 'INV-2501-0001',
                status: InvoiceStatus.DRAFT,
                subtotal: 0,
                taxAmount: 0,
                discountAmount: 0,
                totalAmount: 0,
                paidAmount: 0,
                dueAmount: 0,
                issueDate: new Date(),
                dueDate: new Date(),
                paidDate: null,
                clientId: 'client-id',
                quoteId: null,
                projectId: null,
                createdById: 'user-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                items: jest.fn(),
                client: jest.fn(),
                createdBy: jest.fn(),
                payments: jest.fn(),
            });

            const result = await service.createFromQuote(createInvoiceFromQuoteDto);

            expect(result).toBeDefined();
            expect(prismaService.invoice.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException if quote not found or not approved', async () => {
            const createInvoiceFromQuoteDto = {
                quoteId: 'quote-id',
                createdById: 'user-id',
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(null);

            await expect(service.createFromQuote(createInvoiceFromQuoteDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if invoice already exists for quote', async () => {
            const quote = {
                id: 'quote-id',
                status: 'ACCEPTED',
                clientId: 'client-id',
                items: [],
                client: jest.fn(),
            };

            const createInvoiceFromQuoteDto = {
                quoteId: 'quote-id',
                createdById: 'user-id',
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue({
                ...quote,
                items: jest.fn(),
            } as any);
            jest.spyOn(prismaService.invoice, 'findFirst').mockResolvedValue({
                id: 'existing-invoice-id',
                invoiceNumber: 'INV-2501-0001',
                status: InvoiceStatus.DRAFT,
                subtotal: 0,
                taxAmount: 0,
                discountAmount: 0,
                totalAmount: 0,
                paidAmount: 0,
                dueAmount: 0,
                issueDate: new Date(),
                dueDate: new Date(),
                paidDate: null,
                clientId: 'client-id',
                quoteId: null,
                projectId: null,
                createdById: 'user-id',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                items: jest.fn(),
                client: jest.fn(),
                createdBy: jest.fn(),
                payments: jest.fn(),
            }); // Invoice exists

            await expect(service.createFromQuote(createInvoiceFromQuoteDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('generateInvoiceNumber', () => {
        it('should generate an invoice number with proper format', async () => {
            jest.spyOn(prismaService.invoice, 'count').mockResolvedValue(5);

            // @ts-ignore - acceso a método privado para test
            const result = await service.generateInvoiceNumber();
            
            expect(result).toMatch(/^INV-\d{2}\d{2}-\d{4}$/);
        });
    });

    describe('getInvoiceStats', () => {
        it('should return invoice statistics', async () => {
            jest.spyOn(prismaService.invoice, 'count')
                .mockResolvedValueOnce(10) // totalInvoices
                .mockResolvedValueOnce(7)  // paidInvoices
                .mockResolvedValueOnce(2); // draftInvoices

            jest.spyOn(prismaService.invoice, 'findMany').mockResolvedValue([
                { id: 'overdue1', dueDate: new Date('2024-01-01') },
                { id: 'overdue2', dueDate: new Date('2024-01-01') },
            ] as any);

            jest.spyOn(prismaService.invoice, 'aggregate')
                .mockResolvedValueOnce({ _sum: { totalAmount: 50000 }, _count: {}, _avg: {}, _min: {}, _max: {} }) // totalRevenue
                .mockResolvedValueOnce({ _sum: { dueAmount: 15000 }, _count: {}, _avg: {}, _min: {}, _max: {} });  // outstandingAmount

            const result = await service.getInvoiceStats();

            expect(result).toEqual({
                totalInvoices: 10,
                paidInvoices: 7,
                overdueInvoices: 2,
                draftInvoices: 2,
                totalRevenue: 50000,
                outstandingAmount: 15000,
            });
        });
    });
});