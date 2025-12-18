import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
    @ApiProperty({ description: 'Monto del pago', example: 1250.50 })
    @IsNumber()
    @Min(0.01)
    amount: number;

    @ApiProperty({ description: 'Método de pago', example: 'credit_card' })
    @IsString()
    @IsNotEmpty()
    paymentMethod: string; // credit_card, bank_transfer, paypal, etc.

    @ApiPropertyOptional({ description: 'ID de transacción', example: 'ch_1234567890' })
    @IsOptional()
    @IsString()
    transactionId?: string;

    @ApiPropertyOptional({ description: 'Notas del pago', example: 'Pago parcial recibido' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ description: 'Fecha del pago (ISO 8601)', example: '2026-01-15T10:30:00.000Z' })
    @IsOptional()
    @IsDateString()
    date?: string;
}