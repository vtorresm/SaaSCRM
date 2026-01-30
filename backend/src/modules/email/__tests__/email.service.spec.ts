import { Test, TestingModule } from '@nestjs/testing';
import { EmailService, InvoiceEmailData } from '../email.service';

jest.mock('nodemailer', () => ({
    createTransport: jest.fn().mockReturnValue({
        sendMail: jest.fn(),
    }),
}));

import * as nodemailer from 'nodemailer';

describe('EmailService', () => {
    let service: EmailService;
    let mockTransporter: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EmailService],
        }).compile();

        service = module.get<EmailService>(EmailService);
        mockTransporter = (nodemailer.createTransport as jest.Mock)();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('constructor', () => {
        it('should create transporter with environment variables', () => {
            expect(nodemailer.createTransport).toHaveBeenCalledWith({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        });
    });

    describe('sendInvoice', () => {
        it('should send invoice email with correct parameters', async () => {
            const invoiceData: InvoiceEmailData = {
                invoiceNumber: 'INV-2501-0001',
                totalAmount: 1500.00,
            };
            const to = 'client@example.com';
            const pdfBuffer = Buffer.from('test pdf content');

            await service.sendInvoice(invoiceData, to, pdfBuffer);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to,
                subject: 'Factura INV-2501-0001',
                text: `Adjunto la factura INV-2501-0001 por un monto de 1500.`,
                attachments: [
                    {
                        filename: 'factura-INV-2501-0001.pdf',
                        content: pdfBuffer,
                    },
                ],
            });
        });

        it('should send invoice email without pdf when not provided', async () => {
            const invoiceData: InvoiceEmailData = {
                invoiceNumber: 'INV-2501-0002',
                totalAmount: 2500.50,
            };
            const to = 'client@example.com';

            await service.sendInvoice(invoiceData, to);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to,
                subject: 'Factura INV-2501-0002',
                text: expect.stringContaining('Factura INV-2501-0002'),
                attachments: [],
            });
        });

        it('should handle large amounts correctly', async () => {
            const invoiceData: InvoiceEmailData = {
                invoiceNumber: 'INV-2501-0003',
                totalAmount: 999999.99,
            };
            const to = 'vip@example.com';

            await service.sendInvoice(invoiceData, to);

            const callArgs = mockTransporter.sendMail.mock.calls[0][0];
            expect(callArgs.text).toContain('999999.99');
        });
    });

    describe('sendQuote', () => {
        it('should send quote email with correct parameters', async () => {
            const quoteData = {
                quoteNumber: 'QTE-2501-0001',
                totalAmount: 5000.00,
            };
            const to = 'client@example.com';
            const pdfBuffer = Buffer.from('test pdf content');

            await service.sendQuote(quoteData, to, pdfBuffer);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to,
                subject: 'Cotización QTE-2501-0001',
                text: `Adjunto la cotización QTE-2501-0001 por un monto de 5000.`,
                attachments: [
                    {
                        filename: 'cotizacion-QTE-2501-0001.pdf',
                        content: pdfBuffer,
                    },
                ],
            });
        });

        it('should send quote email without pdf when not provided', async () => {
            const quoteData = {
                quoteNumber: 'QTE-2501-0002',
                totalAmount: 3500.75,
            };
            const to = 'client@example.com';

            await service.sendQuote(quoteData, to);

            expect(mockTransporter.sendMail).toHaveBeenCalledWith({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to,
                subject: 'Cotización QTE-2501-0002',
                text: expect.stringContaining('Cotización QTE-2501-0002'),
                attachments: [],
            });
        });

        it('should handle zero amount quotes', async () => {
            const quoteData = {
                quoteNumber: 'QTE-2501-0003',
                totalAmount: 0,
            };
            const to = 'client@example.com';

            await service.sendQuote(quoteData, to);

            const callArgs = mockTransporter.sendMail.mock.calls[0][0];
            expect(callArgs.text).toContain('0');
        });
    });

    describe('error handling', () => {
        it('should throw error when sendMail fails', async () => {
            const invoiceData: InvoiceEmailData = {
                invoiceNumber: 'INV-2501-0001',
                totalAmount: 100,
            };
            const to = 'client@example.com';

            mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

            await expect(service.sendInvoice(invoiceData, to))
                .rejects.toThrow('SMTP error');
        });

        it('should handle different email addresses', async () => {
            const invoiceData: InvoiceEmailData = {
                invoiceNumber: 'INV-2501-0001',
                totalAmount: 100,
            };

            const emails = [
                'test@example.com',
                'another.test+filter@example.org',
                'user@subdomain.example.com',
            ];

            for (const to of emails) {
                mockTransporter.sendMail.mockClear();
                await service.sendInvoice(invoiceData, to);
                expect(mockTransporter.sendMail).toHaveBeenCalledWith(
                    expect.objectContaining({ to })
                );
            }
        });
    });
});
