import { Controller, Get, Param } from '@nestjs/common';
import { QRService } from './qr.service';

@Controller('qr')
export class QRController {
    constructor(private qrService: QRService) {}

    @Get('payment/:invoiceId')
    async getPaymentQR(@Param('invoiceId') invoiceId: string) {
        return this.qrService.generatePaymentQR(invoiceId);
    }
}