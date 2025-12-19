import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { PayPalController } from './paypal.controller';
import { PayPalService } from './paypal.service';
import { QRController } from './qr.controller';
import { QRService } from './qr.service';
import { PrismaModule } from '../../config/prisma.module';

@Module({
    imports: [PrismaModule, ConfigModule],
    controllers: [InvoicesController, StripeController, PayPalController, QRController],
    providers: [InvoicesService, StripeService, PayPalService, QRService],
    exports: [InvoicesService, StripeService, PayPalService, QRService],
})
export class InvoicesModule {}