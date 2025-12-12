import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { QuotePriority, QuoteStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
    IsArray,
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

export class CreateQuoteItemDto {
    @ApiProperty({ description: 'Descripción del item', example: 'Desarrollo de módulo de usuarios' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    description: string;

    @ApiProperty({ description: 'Cantidad', example: 2 })
    @IsNumber()
    @Min(0.000001)
    quantity: number;

    @ApiProperty({ description: 'Precio unitario', example: 1500 })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiPropertyOptional({ description: 'Unidad', example: 'hour' })
    @IsOptional()
    @IsString()
    unit?: string;

    @ApiPropertyOptional({ description: 'Descuento (monto) por item', example: 0 })
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

    @ApiPropertyOptional({ description: 'Referencia opcional a un servicio', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsOptional()
    @IsUUID()
    serviceId?: string;
}

export class CreateQuoteDto {
    @ApiProperty({ example: 'Cotización CRM - Fase 1' })
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    title: string;

    @ApiPropertyOptional({ example: 'Incluye desarrollo + QA + despliegue' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ enum: QuoteStatus, example: QuoteStatus.DRAFT })
    @IsOptional()
    @IsEnum(QuoteStatus)
    status?: QuoteStatus;

    @ApiPropertyOptional({ enum: QuotePriority, example: QuotePriority.MEDIUM })
    @IsOptional()
    @IsEnum(QuotePriority)
    priority?: QuotePriority;

    /**
     * NOTA: En Sprint 5 el backend recalcula subtotal/tax/discount/total en el service.
     * Se deja opcional para compatibilidad, pero se ignora al persistir.
     */
    @ApiPropertyOptional({ description: 'Subtotal (ignorado; se recalcula)', example: 1000 })
    @IsOptional()
    @IsNumber()
    subtotal?: number;

    /**
     * Se usa como default cuando un item no trae taxRate.
     */
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

    @ApiProperty({ description: 'Usuario asignado', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsUUID()
    assignedToId: string;

    @ApiProperty({ description: 'Usuario creador', example: 'b3f1d6dd-4d6c-4b66-8d85-2a2d9bb4f0d1' })
    @IsUUID()
    createdById: string;

    @ApiPropertyOptional({ description: 'Fecha de validez (ISO 8601)', example: '2026-01-31T00:00:00.000Z' })
    @IsOptional()
    @IsString()
    validUntil?: Date;

    @ApiProperty({ type: [CreateQuoteItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuoteItemDto)
    items: CreateQuoteItemDto[];
}