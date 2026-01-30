import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface InvoiceEmailData {
    invoiceNumber: string;
    totalAmount: number;
}

@Injectable()
export class EmailService {
    private transporter;

    constructor() {
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

    async sendInvoice(invoiceData: InvoiceEmailData, to: string, pdfBuffer?: Buffer) {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject: `Factura ${invoiceData.invoiceNumber}`,
            text: `Adjunto la factura ${invoiceData.invoiceNumber} por un monto de ${invoiceData.totalAmount}.`,
            attachments: pdfBuffer ? [
                {
                    filename: `factura-${invoiceData.invoiceNumber}.pdf`,
                    content: pdfBuffer,
                },
            ] : [],
        });
    }

    async sendQuote(quoteData: { quoteNumber: string; totalAmount: number }, to: string, pdfBuffer?: Buffer) {
        await this.transporter.sendMail({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject: `Cotización ${quoteData.quoteNumber}`,
            text: `Adjunto la cotización ${quoteData.quoteNumber} por un monto de ${quoteData.totalAmount}.`,
            attachments: pdfBuffer ? [
                {
                    filename: `cotizacion-${quoteData.quoteNumber}.pdf`,
                    content: pdfBuffer,
                },
            ] : [],
        });
    }
}
