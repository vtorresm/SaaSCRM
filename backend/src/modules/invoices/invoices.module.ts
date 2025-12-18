import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { PrismaModule } from '../../config/prisma.module';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [InvoicesController, StripeController],
    providers: [InvoicesService, StripeService],
    exports: [InvoicesService, StripeService],
})
export class InvoicesModule {}