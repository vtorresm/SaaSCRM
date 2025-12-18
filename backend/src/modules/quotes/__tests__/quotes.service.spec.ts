import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuoteStatus } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../config/prisma.service';
import { QuotesService } from '../quotes.service';

describe('QuotesService', () => {
    let service: QuotesService;
    let prismaService: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuotesService,
                {
                    provide: PrismaService,
                    useValue: {
                        quote: {
                            create: jest.fn(),
                            findMany: jest.fn(),
                            findUnique: jest.fn(),
                            findFirst: jest.fn(),
                            update: jest.fn(),
                            count: jest.fn(),
                        },
                        quoteItem: {
                            deleteMany: jest.fn(),
                        },
                        quoteVersion: {
                            create: jest.fn(),
                            count: jest.fn(),
                        },
                        $transaction: jest.fn((fn) => fn(prismaService)),
                    },
                },
            ],
        }).compile();

        service = module.get<QuotesService>(QuotesService);
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
            expect(totals.taxAmount).toBe(283.2 * 0.18); // total taxed net = 40+200=240; wait 40+200=240, discount=10, taxed net=230, tax=230*0.18=41.4
            // recalculado: neto antes impuesto = 190, taxAmount = 190*0.18 = 34.2, total = 190+34.2=224.2
            expect(totals.totalAmount).toBe(224.2);
        });

        it('should throw BadRequestException if items is empty', async () => {
            // @ts-ignore
            expect(() => service.calculateTotals([])).toThrow(BadRequestException);
        });
    });

    describe('create', () => {
        it('should create a quote with nested write and calculated totals', async () => {
            const createQuoteDto = {
                title: 'Test Quote',
                clientId: 'client-id',
                assignedToId: 'user-id',
                createdById: 'user-id',
                items: [
                    { description: 'Item 1', quantity: 2, unitPrice: 100, taxRate: 0.18 },
                    { description: 'Item 2', quantity: 1, unitPrice: 50, discount: 5, taxRate: 0.18 },
                ],
                taxRate: 0.18,
            };

            jest.spyOn(prismaService.quote, 'count').mockResolvedValue(0);

            const mockCreated = {
                id: 'quote-id',
                quoteNumber: 'QTE-2501-0001',
                title: 'Test Quote',
                status: QuoteStatus.DRAFT,
                subtotal: 0,
                taxAmount: 0,
                discountAmount: 0,
                totalAmount: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
                items: [],
                client: { id: 'client-id', name: 'Client' },
                assignedTo: { id: 'user-id', firstName: 'User', lastName: 'Test' },
                createdBy: { id: 'user-id', firstName: 'User', lastName: 'Test' },
            };

            jest.spyOn(prismaService.quote, 'create').mockResolvedValue(mockCreated);

            const result = await service.create(createQuoteDto);

            expect(result).toBeDefined();
            expect(prismaService.quote.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    title: 'Test Quote',
                    clientId: 'client-id',
                    assignedToId: 'user-id',
                    createdById: 'user-id',
                    status: QuoteStatus.DRAFT,
                    quoteNumber: 'QTE-2501-0001',
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
        it('should update quote status with valid transition', async () => {
            const existing = {
                id: 'quote-id',
                status: QuoteStatus.DRAFT,
                title: 'Test',
                subtotal: 100,
                taxAmount: 18,
                totalAmount: 118,
                items: [],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);
            jest.spyOn(prismaService, '$transaction').mockImplementation(async (fn) => {
                const tx = {
                    quote: {
                        update: jest.fn().mockResolvedValue({ ...existing, status: QuoteStatus.SENT }),
                    },
                    quoteVersion: {
                        create: jest.fn().mockResolvedValue({ id: 'version-id', versionNumber: 1 }),
                    },
                };
                return fn(tx as any);
            });

            const result = await service.updateStatus('quote-id', QuoteStatus.SENT);

            expect(result.status).toBe(QuoteStatus.SENT);
        });

        it('should throw BadRequestException on invalid transition', async () => {
            const existing = {
                id: 'quote-id',
                status: QuoteStatus.ACCEPTED,
                title: 'Test',
                items: [],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);

            await expect(service.updateStatus('quote-id', QuoteStatus.SENT)).rejects.toThrow(BadRequestException);
        });
    });

    describe('update with items replacement', () => {
        it('should replace items and recalculate totals', async () => {
            const existing = {
                id: 'quote-id',
                status: QuoteStatus.DRAFT,
                title: 'Test',
                items: [{ id: 'old1', description: 'Old', quantity: 1, unitPrice: 50 }],
                versions: [],
            };

            const updateDto = {
                items: [
                    { description: 'New 1', quantity: 2, unitPrice: 100, taxRate: 0.18 },
                    { description: 'New 2', quantity: 1, unitPrice: 25, taxRate: 0.18 },
                ],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);

            jest.spyOn(prismaService, '$transaction').mockImplementation(async (fn) => {
                const tx = {
                    quoteItem: { deleteMany: jest.fn().mockResolvedValue({}) },
                    quote: {
                        update: jest.fn().mockResolvedValue({
                            ...existing,
                            items: [],
                            subtotal: 225,
                            taxAmount: 40.5,
                            totalAmount: 265.5,
                        }),
                    },
                    quoteVersion: { create: jest.fn().mockResolvedValue({ id: 'version-id', versionNumber: 1 }) },
                };
                return fn(tx as any);
            });

            const result = await service.update('quote-id', updateDto as any);

            expect(prismaService.quoteItem.deleteMany).toHaveBeenCalledWith({ where: { quoteId: 'quote-id' } });
            expect(prismaService.quote.update).toHaveBeenCalled();
            expect(result.subtotal).toBe(225);
        });
    });

    describe('findAll', () => {
        it('should return an array of quotes', async () => {
            const mockQuotes = [
                {
                    id: '1',
                    quoteNumber: 'QTE-2501-0001',
                    title: 'Quote 1',
                    status: QuoteStatus.DRAFT,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null,
                },
            ];

            jest.spyOn(prismaService.quote, 'findMany').mockResolvedValue(mockQuotes);

            const result = await service.findAll();
            expect(result).toEqual(mockQuotes);
        });
    });

    describe('generateQuoteNumber', () => {
        it('should generate a quote number with proper format', async () => {
            jest.spyOn(prismaService.quote, 'count').mockResolvedValue(5);

            const result = await service.generateQuoteNumber();
            expect(result).toMatch(/^QTE-\d{2}\d{2}-\d{4}$/);
        });
    });

    describe('createVersion', () => {
        it('should create a quote version', async () => {
            const mockQuote = {
                id: 'test-quote-id',
                title: 'Test Quote',
                description: 'Test Description',
                subtotal: 100,
                taxAmount: 18,
                totalAmount: 118,
                items: [
                    { id: 'item1', description: 'Item 1', quantity: 2, unitPrice: 50, unit: 'unit', discount: 0, taxRate: 0.18, order: 0, totalPrice: 118 },
                ],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(mockQuote as any);
            jest.spyOn(prismaService.quoteVersion, 'count').mockResolvedValue(0);
            jest.spyOn(prismaService.quoteVersion, 'create').mockResolvedValue({
                id: 'version-id',
                quoteId: 'test-quote-id',
                versionNumber: 1,
                createdAt: new Date(),
            });

            const result = await service.createVersion('test-quote-id', 'user-id');
            expect(result).toBeDefined();
            expect(result.versionNumber).toBe(1);
        });

        it('should throw NotFoundException if quote does not exist', async () => {
            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(null);

            await expect(service.createVersion('non-existent', 'user-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('Status convenience methods (Sprint 5)', () => {
        it('should mark quote as viewed', async () => {
            const quoteId = 'test-quote-id';
            const existing = {
                id: quoteId,
                status: QuoteStatus.SENT,
                items: [],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);
            jest.spyOn(service, 'updateStatus').mockResolvedValue({ ...existing, status: QuoteStatus.VIEWED } as any);

            const result = await service.markAsViewed(quoteId);
            expect(service.updateStatus).toHaveBeenCalledWith(quoteId, QuoteStatus.VIEWED);
            expect(result.status).toBe(QuoteStatus.VIEWED);
        });

        it('should accept quote', async () => {
            const quoteId = 'test-quote-id';
            const existing = {
                id: quoteId,
                status: QuoteStatus.VIEWED,
                items: [],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);
            jest.spyOn(service, 'updateStatus').mockResolvedValue({ ...existing, status: QuoteStatus.ACCEPTED } as any);

            const result = await service.accept(quoteId);
            expect(service.updateStatus).toHaveBeenCalledWith(quoteId, QuoteStatus.ACCEPTED);
            expect(result.status).toBe(QuoteStatus.ACCEPTED);
        });

        it('should reject quote', async () => {
            const quoteId = 'test-quote-id';
            const existing = {
                id: quoteId,
                status: QuoteStatus.VIEWED,
                items: [],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);
            jest.spyOn(service, 'updateStatus').mockResolvedValue({ ...existing, status: QuoteStatus.REJECTED } as any);

            const result = await service.reject(quoteId);
            expect(service.updateStatus).toHaveBeenCalledWith(quoteId, QuoteStatus.REJECTED);
            expect(result.status).toBe(QuoteStatus.REJECTED);
        });

        it('should expire quote', async () => {
            const quoteId = 'test-quote-id';
            const existing = {
                id: quoteId,
                status: QuoteStatus.SENT,
                items: [],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);
            jest.spyOn(service, 'updateStatus').mockResolvedValue({ ...existing, status: QuoteStatus.EXPIRED } as any);

            const result = await service.expire(quoteId);
            expect(service.updateStatus).toHaveBeenCalledWith(quoteId, QuoteStatus.EXPIRED);
            expect(result.status).toBe(QuoteStatus.EXPIRED);
        });

        it('should cancel quote', async () => {
            const quoteId = 'test-quote-id';
            const existing = {
                id: quoteId,
                status: QuoteStatus.DRAFT,
                items: [],
                versions: [],
            };

            jest.spyOn(prismaService.quote, 'findFirst').mockResolvedValue(existing as any);
            jest.spyOn(service, 'updateStatus').mockResolvedValue({ ...existing, status: QuoteStatus.CANCELLED } as any);

            const result = await service.cancel(quoteId);
            expect(service.updateStatus).toHaveBeenCalledWith(quoteId, QuoteStatus.CANCELLED);
            expect(result.status).toBe(QuoteStatus.CANCELLED);
        });
    });
});