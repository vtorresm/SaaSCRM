import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInvoiceFromQuoteDto {
    @ApiProperty({ description: 'ID de la cotización aprobada', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsUUID()
    quoteId: string;

    @ApiProperty({ description: 'ID del usuario que genera la factura', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsUUID()
    createdById: string;

    @ApiPropertyOptional({ description: 'Fecha de vencimiento personalizada (ISO 8601)', example: '2026-02-15T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    // Note: notes field not available in current Prisma schema
    // Can be added in future migration if needed

    @ApiPropertyOptional({ description: 'ID del proyecto relacionado (opcional)', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsOptional()
    @IsUUID()
    projectId?: string;
}