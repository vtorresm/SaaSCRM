import { Body, Controller, Get, Headers, Param, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { StripeService } from './stripe.service';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) { }

    @Post('create-payment-intent')
    @ApiOperation({ summary: 'Create payment intent for invoice' })
    @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
    async createPaymentIntent(
        @Body() body: { 
            invoiceId: string; 
            amount: number; 
            currency?: string; 
            metadata?: Record<string, string> 
        }
    ) {
        const { invoiceId, amount, currency = 'usd', metadata = {} } = body;
        
        const paymentIntent = await this.stripeService.createPaymentIntent(
            amount,
            currency,
            { ...metadata, invoiceId },
            invoiceId
        );

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
        };
    }

    @Get('payment-intent/:id')
    @ApiOperation({ summary: 'Retrieve payment intent status' })
    @ApiResponse({ status: 200, description: 'Payment intent retrieved successfully' })
    async retrievePaymentIntent(@Param('id') id: string) {
        const paymentIntent = await this.stripeService.retrievePaymentIntent(id);
        
        return {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            charges: paymentIntent.charges,
        };
    }

    @Post('confirm-payment')
    @ApiOperation({ summary: 'Confirm payment intent' })
    @ApiResponse({ status: 200, description: 'Payment confirmed successfully' })
    async confirmPayment(
        @Body() body: { paymentIntentId: string; paymentMethodId?: string }
    ) {
        const { paymentIntentId, paymentMethodId } = body;
        
        const paymentIntent = await this.stripeService.confirmPaymentIntent(
            paymentIntentId,
            paymentMethodId
        );

        return {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            charges: paymentIntent.charges,
        };
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Handle Stripe webhooks' })
    @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
    async handleWebhook(
        @Req() req: Request,
        @Res() res: Response,
        @Headers('stripe-signature') signature: string
    ) {
        try {
            const payload = JSON.stringify(req.body);
            const result = await this.stripeService.handleWebhook(payload, signature);
            
            return res.status(200).json({ received: true, ...result });
        } catch (error) {
            console.error('Webhook error:', error.message);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }

    @Get('config')
    @ApiOperation({ summary: 'Get Stripe configuration' })
    @ApiResponse({ status: 200, description: 'Stripe configuration retrieved successfully' })
    async getConfig() {
        return {
            publishableKey: this.stripeService.getPublishableKey(),
            isSandbox: this.stripeService.isSandboxMode(),
        };
    }

    // Test endpoint for sandbox mode
    @Post('test-payment')
    @ApiOperation({ summary: 'Test payment (sandbox only)' })
    @ApiResponse({ status: 200, description: 'Test payment processed successfully' })
    async testPayment(@Body() body: { amount: number; invoiceId?: string }) {
        if (!this.stripeService.isSandboxMode()) {
            return { error: 'Test payments only available in sandbox mode' };
        }

        const { amount, invoiceId } = body;
        
        // Create a test payment intent
        const paymentIntent = await this.stripeService.createPaymentIntent(
            amount,
            'usd',
            { test: 'true', invoiceId },
            invoiceId
        );

        return {
            message: 'Test payment intent created',
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
            testMode: true,
        };
    }
}