import { Controller, Post, Body } from '@nestjs/common';
import { PayPalService } from './paypal.service';

@Controller('paypal')
export class PayPalController {
    constructor(private paypalService: PayPalService) {}

    @Post('create-payment')
    async createPayment(@Body() body: { amount: number; currency?: string; description: string; invoiceId: string }) {
        return this.paypalService.createPayment(body.amount, body.currency, body.description, body.invoiceId);
    }

    @Post('execute-payment')
    async executePayment(@Body() body: { paymentId: string; payerId: string }) {
        return this.paypalService.executePayment(body.paymentId, body.payerId);
    }

    @Post('webhook')
    async handleWebhook(@Body() body: any) {
        // Handle PayPal webhook
        console.log('PayPal webhook:', body);
        // Process based on event type
        return { received: true };
    }
}