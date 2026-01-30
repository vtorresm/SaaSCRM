import { Test, TestingModule } from '@nestjs/testing';
import { EmailService, InvoiceEmailData } from '../email.service';

describe('EmailService', () => {
    let service: EmailService;
    let sendMailMock: jest.Mock;

    beforeEach(async () => {
        sendMailMock = jest.fn().mockResolvedValue(undefined);

        jest.doMock('nodemailer', () => ({
            createTransport: jest.fn().mockReturnValue({
                sendMail: sendMailMock,
            }),
        }));

        // Clear module cache to get fresh import
        jest.resetModules();

        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailService],
        }).compile();

        service = module.get<EmailService>(EmailService);
    });

    afterEach(() => {
        jest.resetModules();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendInvoice', () => {
        it('should send invoice email with pdf', async () => {
            const invoiceData: InvoiceEmailData = {
                invoiceNumber: 'INV-001',
                totalAmount: 100,
            };
            const to = 'test@example.com';
            const pdfBuffer = Buffer.from('pdf content');

            await service.sendInvoice(invoiceData, to, pdfBuffer);

            expect(sendMailMock).toHaveBeenCalledTimes(1);
            const call = sendMailMock.mock.calls[0][0];
            expect(call.to).toBe(to);
            expect(call.subject).toBe('Factura INV-001');
            expect(call.attachments).toHaveLength(1);
            expect(call.attachments[0].filename).toBe('factura-INV-001.pdf');
        });

        it('should send invoice email without pdf', async () => {
            const invoiceData: InvoiceEmailData = {
                invoiceNumber: 'INV-002',
                totalAmount: 200,
            };
            const to = 'test2@example.com';

            await service.sendInvoice(invoiceData, to);

            expect(sendMailMock).toHaveBeenCalledTimes(1);
            const call = sendMailMock.mock.calls[0][0];
            expect(call.attachments).toHaveLength(0);
        });
    });

    describe('sendQuote', () => {
        it('should send quote email with pdf', async () => {
            const quoteData = {
                quoteNumber: 'QTE-001',
                totalAmount: 500,
            };
            const to = 'client@example.com';
            const pdfBuffer = Buffer.from('pdf content');

            await service.sendQuote(quoteData, to, pdfBuffer);

            expect(sendMailMock).toHaveBeenCalledTimes(1);
            const call = sendMailMock.mock.calls[0][0];
            expect(call.subject).toBe('Cotización QTE-001');
            expect(call.attachments[0].filename).toBe('cotizacion-QTE-001.pdf');
        });

        it('should send quote email without pdf', async () => {
            const quoteData = {
                quoteNumber: 'QTE-002',
                totalAmount: 300,
            };
            const to = 'client2@example.com';

            await service.sendQuote(quoteData, to);

            expect(sendMailMock).toHaveBeenCalledTimes(1);
            const call = sendMailMock.mock.calls[0][0];
            expect(call.attachments).toHaveLength(0);
        });
    });
});
