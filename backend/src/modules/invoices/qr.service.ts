import { Injectable } from '@nestjs/common';
import * as qrcode from 'qrcode';

@Injectable()
export class QRService {
    async generatePaymentQR(invoiceId: string) {
        const paymentUrl = `${process.env.FRONTEND_URL}/pay/${invoiceId}`;
        const qrCodeDataURL = await qrcode.toDataURL(paymentUrl);
        return {
            invoiceId,
            paymentUrl,
            qrCode: qrCodeDataURL,
        };
    }
}