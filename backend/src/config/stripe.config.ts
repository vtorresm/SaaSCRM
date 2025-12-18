import { ConfigService } from '@nestjs/config';

export interface StripeConfig {
    secretKey: string;
    publishableKey: string;
    webhookSecret?: string;
    isSandbox: boolean;
}

export const getStripeConfig = (configService: ConfigService): StripeConfig => {
    const isSandbox = configService.get('NODE_ENV') !== 'production';
    
    return {
        secretKey: configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_your_key_here',
        publishableKey: configService.get<string>('STRIPE_PUBLISHABLE_KEY') || 'pk_test_your_key_here',
        webhookSecret: configService.get<string>('STRIPE_WEBHOOK_SECRET'),
        isSandbox,
    };
};

export const STRIPE_ERROR_CODES = {
    CARD_DECLINED: 'card_declined',
    INSUFFICIENT_FUNDS: 'insufficient_funds',
    INCORRECT_CVC: 'incorrect_cvc',
    EXPIRED_CARD: 'expired_card',
    PROCESSING_ERROR: 'processing_error',
    INCORRECT_NUMBER: 'incorrect_number',
} as const;

export type StripeErrorCode = typeof STRIPE_ERROR_CODES[keyof typeof STRIPE_ERROR_CODES];