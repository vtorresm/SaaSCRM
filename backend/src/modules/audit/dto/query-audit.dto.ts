import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';

export class QueryAuditDto {
    @ApiPropertyOptional({ enum: AuditAction })
    @IsEnum(AuditAction)
    @IsOptional()
    action?: AuditAction;

    @ApiPropertyOptional({ description: 'Tipo de entidad (User, Company, Quote, etc.)' })
    @IsString()
    @IsOptional()
    entityType?: string;

    @ApiPropertyOptional({ description: 'ID de la entidad' })
    @IsString()
    @IsOptional()
    entityId?: string;

    @ApiPropertyOptional({ description: 'ID del usuario que realizó la acción' })
    @IsString()
    @IsOptional()
    userId?: string;

    @ApiPropertyOptional({ description: 'Fecha desde' })
    @IsDateString()
    @IsOptional()
    from?: string;

    @ApiPropertyOptional({ description: 'Fecha hasta' })
    @IsDateString()
    @IsOptional()
    to?: string;

    @ApiPropertyOptional({ description: 'Número de página', example: 1 })
    @IsNumber()
    @Min(1)
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ description: 'Registros por página', example: 20 })
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number;
}
