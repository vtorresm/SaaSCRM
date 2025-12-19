import { Injectable } from '@nestjs/common';
import * as paypal from 'paypal-rest-sdk';

@Injectable()
export class PayPalService {
    constructor() {
        paypal.configure({
            mode: process.env.PAYPAL_MODE || 'sandbox',
            client_id: process.env.PAYPAL_CLIENT_ID,
            client_secret: process.env.PAYPAL_CLIENT_SECRET,
        });
    }

    async createPayment(amount: number, currency: string = 'USD', description: string, invoiceId: string) {
        const create_payment_json = {
            intent: 'sale',
            payer: {
                payment_method: 'paypal',
            },
            redirect_urls: {
                return_url: `${process.env.FRONTEND_URL}/payment/success`,
                cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            },
            transactions: [{
                item_list: {
                    items: [{
                        name: description,
                        sku: invoiceId,
                        price: amount.toString(),
                        currency: currency,
                        quantity: 1,
                    }],
                },
                amount: {
                    currency: currency,
                    total: amount.toString(),
                },
                description: description,
            }],
        };

        return new Promise((resolve, reject) => {
            paypal.payment.create(create_payment_json, (error, payment) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(payment);
                }
            });
        });
    }

    async executePayment(paymentId: string, payerId: string) {
        const execute_payment_json = {
            payer_id: payerId,
        };

        return new Promise((resolve, reject) => {
            paypal.payment.execute(paymentId, execute_payment_json, (error, payment) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(payment);
                }
            });
        });
    }
}