import { ApiProperty } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateInvoiceStatusDto {
    @ApiProperty({ enum: InvoiceStatus, example: InvoiceStatus.SENT })
    @IsEnum(InvoiceStatus, { message: 'Estado de factura inválido' })
    status: InvoiceStatus;
}