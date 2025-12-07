import { Test, TestingModule } from '@nestjs/testing';
import { QuoteEmailService } from '../email-templates/quote-email.service';
import { QuotesService } from '../quotes.service';

describe('QuoteEmailService', () => {
    let service: QuoteEmailService;
    let quotesService: QuotesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QuoteEmailService,
                {
                    provide: QuotesService,
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<QuoteEmailService>(QuoteEmailService);
        quotesService = module.get<QuotesService>(QuotesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateQuoteEmail', () => {
        it('should generate a creation email template', async () => {
            const mockQuote = {
                id: 'test-quote-id',
                quoteNumber: 'QTE-2301-0001',
                title: 'Test Quote',
                client: {
                    name: 'Test Company',
                },
                totalAmount: 1000,
                sentAt: new Date(),
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };

            jest.spyOn(quotesService, 'findOne').mockResolvedValue(mockQuote);

            const result = await service.generateQuoteEmail('test-quote-id', 'creation');
            expect(result).toBeDefined();
            expect(result.subject).toContain(mockQuote.quoteNumber);
            expect(result.html).toContain(mockQuote.quoteNumber);
            expect(result.text).toContain(mockQuote.quoteNumber);
        });

        it('should generate a reminder email template', async () => {
            const mockQuote = {
                id: 'test-quote-id',
                quoteNumber: 'QTE-2301-0001',
                title: 'Test Quote',
                client: {
                    name: 'Test Company',
                },
                totalAmount: 1000,
                sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };

            jest.spyOn(quotesService, 'findOne').mockResolvedValue(mockQuote);

            const result = await service.generateQuoteEmail('test-quote-id', 'reminder');
            expect(result).toBeDefined();
            expect(result.subject).toContain('Reminder');
            expect(result.html).toContain('reminder');
        });
    });

    describe('sendQuoteEmail', () => {
        it('should send a quote email (simulated)', async () => {
            const mockQuote = {
                id: 'test-quote-id',
                quoteNumber: 'QTE-2301-0001',
                title: 'Test Quote',
                client: {
                    name: 'Test Company',
                },
                totalAmount: 1000,
                sentAt: new Date(),
                validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            };

            jest.spyOn(quotesService, 'findOne').mockResolvedValue(mockQuote);

            const result = await service.sendQuoteEmail('test-quote-id', 'test@example.com', 'creation');
            expect(result).toBeDefined();
            expect(result.success).toBe(true);
            expect(result.email.to).toBe('test@example.com');
        });
    });
});