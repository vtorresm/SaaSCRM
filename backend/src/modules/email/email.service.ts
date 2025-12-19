import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class EmailService {
    private transporter;

    constructor(private invoicesService: InvoicesService) {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async sendInvoice(invoiceId: string, to: string) {
        const invoice = await this.invoicesService.findOne(invoiceId);
        if (!invoice) {
            throw new Error('Invoice not found');
        }
        const pdfBuffer = await this.invoicesService.generatePdf(invoiceId);
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject: `Factura ${invoice.invoiceNumber}`,
            text: `Adjunto la factura ${invoice.invoiceNumber} por un monto de ${invoice.totalAmount}.`,
            attachments: [
                {
                    filename: `factura-${invoice.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });
    }
}