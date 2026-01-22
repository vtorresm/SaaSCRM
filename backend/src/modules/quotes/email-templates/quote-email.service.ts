import { Injectable } from '@nestjs/common';
import { QuotesService } from '../quotes.service';

@Injectable()
export class QuoteEmailService {
    constructor(private quotesService: QuotesService) { }

    async generateQuoteEmail(quoteId: string, templateType: 'creation' | 'reminder' | 'followup' = 'creation') {
        const quote = await this.quotesService.findOne(quoteId);
        if (!quote) {
            throw new Error('Quote not found');
        }

        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const quoteUrl = `${baseUrl}/quotes/${quote.id}/view`;

        const templates = {
            creation: {
                subject: `New Quote ${quote.quoteNumber} from ${quote.client.name}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">New Quote Available</h2>
            <p>Dear Customer,</p>
            <p>A new quote (${quote.quoteNumber}) has been created for you. You can view and download the quote using the button below:</p>
            <a href="${quoteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">View Quote</a>
            <p>Quote Summary:</p>
            <ul>
              <li><strong>Quote Number:</strong> ${quote.quoteNumber}</li>
              <li><strong>Title:</strong> ${quote.title}</li>
              <li><strong>Total Amount:</strong> $${quote.totalAmount.toFixed(2)}</li>
              <li><strong>Valid Until:</strong> ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</li>
            </ul>
            <p>Thank you for your business!</p>
            <p style="color: #7f8c8d; font-size: 0.9em;">This is an automated email. Please do not reply.</p>
          </div>
        `,
                text: `New Quote ${quote.quoteNumber} from ${quote.client.name}\n\nDear Customer,\n\nA new quote (${quote.quoteNumber}) has been created for you. You can view it at: ${quoteUrl}\n\nQuote Summary:\n- Quote Number: ${quote.quoteNumber}\n- Title: ${quote.title}\n- Total Amount: $${quote.totalAmount.toFixed(2)}\n- Valid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}\n\nThank you for your business!`
            },
            reminder: {
                subject: `Reminder: Quote ${quote.quoteNumber} from ${quote.client.name}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Friendly Reminder</h2>
            <p>Dear Customer,</p>
            <p>This is a friendly reminder about quote ${quote.quoteNumber} that was sent to you on ${quote.sentAt ? new Date(quote.sentAt).toLocaleDateString() : 'N/A'}.</p>
            <a href="${quoteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">View Quote</a>
            <p>Quote Summary:</p>
            <ul>
              <li><strong>Quote Number:</strong> ${quote.quoteNumber}</li>
              <li><strong>Title:</strong> ${quote.title}</li>
              <li><strong>Total Amount:</strong> $${quote.totalAmount.toFixed(2)}</li>
              <li><strong>Valid Until:</strong> ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</li>
            </ul>
            <p>Please let us know if you have any questions.</p>
            <p style="color: #7f8c8d; font-size: 0.9em;">This is an automated email. Please do not reply.</p>
          </div>
        `,
                text: `Reminder: Quote ${quote.quoteNumber} from ${quote.client.name}\n\nDear Customer,\n\nThis is a friendly reminder about quote ${quote.quoteNumber} that was sent to you on ${quote.sentAt ? new Date(quote.sentAt).toLocaleDateString() : 'N/A'}.\n\nYou can view it at: ${quoteUrl}\n\nQuote Summary:\n- Quote Number: ${quote.quoteNumber}\n- Title: ${quote.title}\n- Total Amount: $${quote.totalAmount.toFixed(2)}\n- Valid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}\n\nPlease let us know if you have any questions.`
            },
            followup: {
                subject: `Follow-up: Quote ${quote.quoteNumber} from ${quote.client.name}`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Follow-up on Your Quote</h2>
            <p>Dear Customer,</p>
            <p>We wanted to follow up regarding quote ${quote.quoteNumber} that we sent you on ${quote.sentAt ? new Date(quote.sentAt).toLocaleDateString() : 'N/A'}.</p>
            <a href="${quoteUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0;">View Quote</a>
            <p>Quote Summary:</p>
            <ul>
              <li><strong>Quote Number:</strong> ${quote.quoteNumber}</li>
              <li><strong>Title:</strong> ${quote.title}</li>
              <li><strong>Total Amount:</strong> $${quote.totalAmount.toFixed(2)}</li>
              <li><strong>Valid Until:</strong> ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}</li>
            </ul>
            <p>We'd be happy to answer any questions you may have or discuss the quote further.</p>
            <p style="color: #7f8c8d; font-size: 0.9em;">This is an automated email. Please do not reply.</p>
          </div>
        `,
                text: `Follow-up: Quote ${quote.quoteNumber} from ${quote.client.name}\n\nDear Customer,\n\nWe wanted to follow up regarding quote ${quote.quoteNumber} that we sent you on ${quote.sentAt ? new Date(quote.sentAt).toLocaleDateString() : 'N/A'}.\n\nYou can view it at: ${quoteUrl}\n\nQuote Summary:\n- Quote Number: ${quote.quoteNumber}\n- Title: ${quote.title}\n- Total Amount: $${quote.totalAmount.toFixed(2)}\n- Valid Until: ${quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : 'N/A'}\n\nWe'd be happy to answer any questions you may have or discuss the quote further.`
            }
        };

        return templates[templateType];
    }

    async sendQuoteEmail(quoteId: string, to: string, templateType: 'creation' | 'reminder' | 'followup' = 'creation') {
        const emailTemplate = await this.generateQuoteEmail(quoteId, templateType);

        // In a real implementation, this would use a service like Nodemailer or SendGrid
        console.log(`Sending email to ${to}:`);
        console.log(`Subject: ${emailTemplate.subject}`);
        console.log(`Content: ${emailTemplate.text}`);

        return {
            success: true,
            message: 'Email sent successfully (simulated)',
            email: {
                to,
                subject: emailTemplate.subject,
                sentAt: new Date(),
            }
        };
    }
}