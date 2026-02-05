import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';

export class CreateAuditLogDto {
    @ApiProperty({ enum: AuditAction, example: AuditAction.CREATE })
    @IsEnum(AuditAction)
    action: AuditAction;

    @ApiProperty({ description: 'Tipo de entidad', example: 'Company' })
    @IsString()
    entityType: string;

    @ApiProperty({ description: 'ID de la entidad' })
    @IsString()
    entityId: string;

    @ApiPropertyOptional({ description: 'Valores anteriores' })
    @IsObject()
    @IsOptional()
    oldValues?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Valores nuevos' })
    @IsObject()
    @IsOptional()
    newValues?: Record<string, any>;

    @ApiPropertyOptional({ description: 'Dirección IP' })
    @IsString()
    @IsOptional()
    ipAddress?: string;

    @ApiPropertyOptional({ description: 'User Agent' })
    @IsString()
    @IsOptional()
    userAgent?: string;

    @ApiPropertyOptional({ description: 'ID del usuario' })
    @IsString()
    @IsOptional()
    userId?: string;
}
