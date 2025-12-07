import { Controller, Post, Body, Param } from '@nestjs/common';
import { QuoteEmailService } from './quote-email.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('quote-emails')
@Controller('quote-emails')
export class QuoteEmailController {
    constructor(private readonly quoteEmailService: QuoteEmailService) { }

    @Post(':quoteId/send')
    @ApiOperation({ summary: 'Send quote email' })
    @ApiResponse({ status: 200, description: 'Email sent successfully' })
    async sendQuoteEmail(
        @Param('quoteId') quoteId: string,
        @Body('to') to: string,
        @Body('templateType') templateType: 'creation' | 'reminder' | 'followup' = 'creation'
    ) {
        return this.quoteEmailService.sendQuoteEmail(quoteId, to, templateType);
    }

    @Post(':quoteId/preview')
    @ApiOperation({ summary: 'Preview quote email' })
    @ApiResponse({ status: 200, description: 'Email template preview' })
    async previewQuoteEmail(
        @Param('quoteId') quoteId: string,
        @Body('templateType') templateType: 'creation' | 'reminder' | 'followup' = 'creation'
    ) {
        return this.quoteEmailService.generateQuoteEmail(quoteId, templateType);
    }
}