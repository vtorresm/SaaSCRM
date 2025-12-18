import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Min,
    MinLength,
    ValidateNested,
} from 'class-validator';

export class CreateInvoiceItemDto {
    @ApiProperty({ description: 'Descripción del item', example: 'Desarrollo de módulo CRM' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    description: string;

    @ApiProperty({ description: 'Cantidad', example: 1 })
    @IsNumber()
    @Min(0.000001)
    quantity: number;

    @ApiProperty({ description: 'Precio unitario', example: 2500 })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional({ description: 'Descuento por item', example: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discount?: number;

    @ApiPropertyOptional({ description: 'Tasa de impuesto por item (0.18 = 18%)', example: 0.18 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    taxRate?: number;

    @ApiPropertyOptional({ description: 'Orden del item para visualización', example: 0 })
    @IsOptional()
    @IsNumber()
    order?: number;
}

export class CreateInvoiceDto {
    @ApiPropertyOptional({ enum: InvoiceStatus, example: InvoiceStatus.DRAFT })
    @IsOptional()
    @IsEnum(InvoiceStatus)
    status?: InvoiceStatus;

    @ApiProperty({ description: 'Fecha de vencimiento (ISO 8601)', example: '2026-01-31T00:00:00.000Z' })
    @IsDateString()
    dueDate: string;

    @ApiPropertyOptional({ description: 'Notas adicionales', example: 'Pago a 30 días' })
    @IsOptional()
    @IsString()
    notes?: string;

    /**
     * NOTA: En Sprint 6 el backend recalcula subtotal/tax/discount/total en el service.
     * Se deja opcional para compatibilidad, pero se ignora al persistir.
     */
    @ApiPropertyOptional({ description: 'Subtotal (ignorado; se recalcula)', example: 2500 })
    @IsOptional()
    @IsNumber()
    subtotal?: number;

    @ApiPropertyOptional({ description: 'Tasa de impuesto default para items', example: 0.18 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    taxRate?: number;

    @ApiPropertyOptional({ description: 'Descuento total (ignorado; se recalcula)', example: 0 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    discountAmount?: number;

    @ApiProperty({ description: 'Empresa/cliente', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsUUID()
    clientId: string;

    @ApiPropertyOptional({ description: 'Cotización relacionada (opcional)', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsOptional()
    @IsUUID()
    quoteId?: string;

    @ApiPropertyOptional({ description: 'Proyecto relacionado (opcional)', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiProperty({ description: 'Usuario creador', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsUUID()
    createdById: string;

    @ApiProperty({ type: [CreateInvoiceItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    items: CreateInvoiceItemDto[];
}