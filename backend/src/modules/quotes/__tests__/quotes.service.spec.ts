import { Test, TestingModule } from '@nestjs/testing';
import { QuotesService } from '../quotes.service';
import { PrismaService } from '../../../config/prisma.service';
import { CompaniesService } from '../../companies/companies.service';
import { ContactsService } from '../../contacts/contacts.service';

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
                            update: jest.fn(),
                            count: jest.fn(),
                        },
                        quoteVersion: {
                            create: jest.fn(),
                            count: jest.fn(),
                        },
                    },
                },
                {
                    provide: CompaniesService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: ContactsService,
                    useValue: {
                        findOne: jest.fn(),
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

    describe('create', () => {
        it('should create a quote with calculated totals', async () => {
            const createQuoteDto = {
                title: 'Test Quote',
                clientId: 'test-client-id',
                assignedToId: 'test-user-id',
                createdById: 'test-user-id',
                items: [
                    { description: 'Item 1', quantity: 2, unitPrice: 100 },
                    { description: 'Item 2', quantity: 1, unitPrice: 50 },
                ],
                taxRate: 0.18,
            };

            jest.spyOn(prismaService.quote, 'count').mockResolvedValue(0);
            jest.spyOn(prismaService.quote, 'create').mockResolvedValue({
                id: 'test-quote-id',
                ...createQuoteDto,
                quoteNumber: 'QTE-2301-0001',
                subtotal: 250,
                taxAmount: 45,
                totalAmount: 295,
                status: 'DRAFT',
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            });

            const result = await service.create(createQuoteDto);
            expect(result).toBeDefined();
            expect(result.quoteNumber).toBe('QTE-2301-0001');
            expect(result.subtotal).toBe(250);
            expect(result.totalAmount).toBe(295);
        });
    });

    describe('findAll', () => {
        it('should return an array of quotes', async () => {
            const mockQuotes = [
                {
                    id: '1',
                    quoteNumber: 'QTE-2301-0001',
                    title: 'Quote 1',
                    status: 'DRAFT',
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
                items: [],
            };

            jest.spyOn(prismaService.quote, 'findUnique').mockResolvedValue(mockQuote);
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
    });
});