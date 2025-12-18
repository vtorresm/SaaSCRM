import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getStripeConfig, STRIPE_ERROR_CODES } from '../../config/stripe.config';

// Mock Stripe implementation for sandbox mode
// In production, this would use the actual Stripe SDK
interface MockStripe {
    paymentIntents: {
        create: (params: any) => Promise<any>;
        retrieve: (id: string) => Promise<any>;
        confirm: (id: string, params?: any) => Promise<any>;
    };
    webhooks: {
        constructEvent: (payload: string, signature: string, secret: string) => any;
    };
}

@Injectable()
export class StripeService {
    private readonly logger = new Logger(StripeService.name);
    private readonly stripe: MockStripe;
    private readonly config: ReturnType<typeof getStripeConfig>;

    constructor(private configService: ConfigService) {
        this.config = getStripeConfig(this.configService);
        
        // Mock Stripe implementation for sandbox
        this.stripe = {
            paymentIntents: {
                create: this.mockCreatePaymentIntent.bind(this),
                retrieve: this.mockRetrievePaymentIntent.bind(this),
                confirm: this.mockConfirmPaymentIntent.bind(this),
            },
            webhooks: {
                constructEvent: this.mockConstructWebhookEvent.bind(this),
            },
        };

        this.logger.log(`Stripe initialized in ${this.config.isSandbox ? 'sandbox' : 'production'} mode`);
    }

    // Mock implementation for sandbox mode
    private async mockCreatePaymentIntent(params: any) {
        this.logger.log(`Mock: Creating payment intent for amount: ${params.amount}`);
        
        // Simulate different responses based on amount or other parameters
        if (params.amount > 100000) { // > $1000
            throw new Error('Amount too high for sandbox');
        }

        return {
            id: `pi_mock_${Date.now()}`,
            client_secret: `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
            amount: params.amount,
            currency: params.currency || 'usd',
            status: 'requires_payment_method',
            metadata: params.metadata || {},
        };
    }

    private async mockRetrievePaymentIntent(id: string) {
        this.logger.log(`Mock: Retrieving payment intent: ${id}`);
        
        return {
            id,
            status: 'succeeded',
            amount: 10000, // $100.00
            currency: 'usd',
            charges: {
                data: [{
                    id: `ch_mock_${Date.now()}`,
                    amount: 10000,
                    status: 'succeeded',
                    payment_method: 'pm_mock_card',
                }],
            },
        };
    }

    private async mockConfirmPaymentIntent(id: string, params?: any) {
        this.logger.log(`Mock: Confirming payment intent: ${id}`);
        
        return {
            id,
            status: 'succeeded',
            amount: 10000,
            currency: 'usd',
            charges: {
                data: [{
                    id: `ch_mock_${Date.now()}`,
                    amount: 10000,
                    status: 'succeeded',
                    payment_method: params?.payment_method || 'pm_mock_card',
                }],
            },
        };
    }

    private mockConstructWebhookEvent(payload: string, signature: string, secret: string) {
        this.logger.log('Mock: Constructing webhook event');
        
        // Parse the mock webhook payload
        const event = JSON.parse(payload);
        return event;
    }

    // Public methods
    async createPaymentIntent(
        amount: number,
        currency: string = 'usd',
        metadata: Record<string, string> = {},
        invoiceId?: string
    ) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                metadata: {
                    invoiceId,
                    ...metadata,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            this.logger.log(`Payment intent created: ${paymentIntent.id}`);
            return paymentIntent;
        } catch (error) {
            this.logger.error(`Failed to create payment intent: ${error.message}`);
            throw new Error(`Payment intent creation failed: ${error.message}`);
        }
    }

    async retrievePaymentIntent(paymentIntentId: string) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
            this.logger.log(`Payment intent retrieved: ${paymentIntentId}`);
            return paymentIntent;
        } catch (error) {
            this.logger.error(`Failed to retrieve payment intent: ${error.message}`);
            throw new Error(`Payment intent retrieval failed: ${error.message}`);
        }
    }

    async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
                payment_method: paymentMethodId,
            });

            this.logger.log(`Payment intent confirmed: ${paymentIntentId}`);
            return paymentIntent;
        } catch (error) {
            this.logger.error(`Failed to confirm payment intent: ${error.message}`);
            throw new Error(`Payment confirmation failed: ${error.message}`);
        }
    }

    async handleWebhook(payload: string, signature: string): Promise<any> {
        try {
            if (this.config.webhookSecret) {
                const event = this.stripe.webhooks.constructEvent(
                    payload,
                    signature,
                    this.config.webhookSecret
                );

                this.logger.log(`Webhook event constructed: ${event.type}`);
                return this.processWebhookEvent(event);
            } else {
                this.logger.warn('No webhook secret configured, skipping signature verification');
                const event = JSON.parse(payload);
                return this.processWebhookEvent(event);
            }
        } catch (error) {
            this.logger.error(`Webhook processing failed: ${error.message}`);
            throw new Error(`Webhook processing failed: ${error.message}`);
        }
    }

    private async processWebhookEvent(event: any) {
        this.logger.log(`Processing webhook event: ${event.type}`);

        switch (event.type) {
            case 'payment_intent.succeeded':
                return this.handlePaymentSucceeded(event.data.object);
            
            case 'payment_intent.payment_failed':
                return this.handlePaymentFailed(event.data.object);
            
            case 'charge.dispute.created':
                return this.handleChargeDispute(event.data.object);
            
            default:
                this.logger.log(`Unhandled event type: ${event.type}`);
                return { received: true };
        }
    }

    private async handlePaymentSucceeded(paymentIntent: any) {
        this.logger.log(`Payment succeeded: ${paymentIntent.id}`);
        
        // Here you would update the invoice status in your database
        // For now, just log the event
        return {
            event: 'payment_intent.succeeded',
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            invoiceId: paymentIntent.metadata?.invoiceId,
        };
    }

    private async handlePaymentFailed(paymentIntent: any) {
        this.logger.log(`Payment failed: ${paymentIntent.id}`);
        
        return {
            event: 'payment_intent.payment_failed',
            paymentIntentId: paymentIntent.id,
            lastPaymentError: paymentIntent.last_payment_error,
            invoiceId: paymentIntent.metadata?.invoiceId,
        };
    }

    private async handleChargeDispute(charge: any) {
        this.logger.log(`Charge dispute created: ${charge.id}`);
        
        return {
            event: 'charge.dispute.created',
            chargeId: charge.id,
            amount: charge.amount,
            reason: charge.dispute?.reason,
            invoiceId: charge.metadata?.invoiceId,
        };
    }

    // Utility methods
    formatAmountForStripe(amount: number): number {
        return Math.round(amount * 100); // Convert to cents
    }

    formatAmountFromStripe(amount: number): number {
        return amount / 100; // Convert from cents
    }

    getPublishableKey(): string {
        return this.config.publishableKey;
    }

    isSandboxMode(): boolean {
        return this.config.isSandbox;
    }

    // Error handling
    parseStripeError(error: any): { code: string; message: string } {
        if (error.type === 'StripeCardError') {
            return {
                code: error.code || STRIPE_ERROR_CODES.PROCESSING_ERROR,
                message: error.message || 'Payment processing failed',
            };
        }

        return {
            code: STRIPE_ERROR_CODES.PROCESSING_ERROR,
            message: error.message || 'An unexpected error occurred',
        };
    }
}