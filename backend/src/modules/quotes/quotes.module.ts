import { Module } from '@nestjs/common';
import { QuotesController } from './quotes.controller';
import { QuotesService } from './quotes.service';
import { CompaniesModule } from '../companies/companies.module';
import { ContactsModule } from '../contacts/contacts.module';
import { QuoteEmailService } from './email-templates/quote-email.service';
import { QuoteEmailController } from './email-templates/quote-email.controller';

@Module({
    imports: [CompaniesModule, ContactsModule],
    controllers: [QuotesController, QuoteEmailController],
    providers: [QuotesService, QuoteEmailService],
    exports: [QuotesService, QuoteEmailService],
})
export class QuotesModule { }